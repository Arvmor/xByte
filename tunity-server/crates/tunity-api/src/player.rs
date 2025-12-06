use crate::x402::{ConfigX402, FacilitatorRequest, PaymentExtractor, PaymentRequest, X402Response};
use crate::{Database, MemoryDB, ResultAPI};
use actix_multipart::form::MultipartForm;
use actix_multipart::form::tempfile::TempFile;
use actix_web::Responder;
use actix_web::dev::HttpServiceFactory;
use actix_web::{HttpRequest, post, web};
use serde::Deserialize;
use std::io::Read;

/// The Player Routes
#[derive(Debug)]
pub enum PlayerRoute {
    /// The play endpoint
    Play,
    /// The set content endpoint
    SetContent,
}

impl HttpServiceFactory for PlayerRoute {
    fn register(self, config: &mut actix_web::dev::AppService) {
        match self {
            Self::Play => play.register(config),
            Self::SetContent => set_content.register(config),
        }
    }
}

/// The request to play a sample
#[derive(Debug, Deserialize)]
pub struct PlayRequest {
    /// The file to play
    pub file: String,
    /// The offset to start playing from
    pub offset: usize,
    /// The length of the sample to play
    pub length: usize,
}

/// The play endpoint
#[post("/play")]
async fn play(
    request: HttpRequest,
    db: web::ThinData<MemoryDB>,
    config: web::Data<ConfigX402<&'static str>>,
    payload: web::Json<PlayRequest>,
    auth: Option<PaymentExtractor>,
) -> impl Responder {
    let url = request.full_url();
    let price = db.get_price(&payload.file).unwrap_or("1000".to_string());
    let req = PaymentRequest::new(&config, price.to_string(), "Access to play the track", url);
    let request = X402Response::new(&[req]);

    // Check received payment
    let Some(payment) = auth else {
        return ResultAPI::payment_required(request);
    };

    // Verify and settle the payment
    let facilitator = FacilitatorRequest::new(payment, request.accepts[0].clone());
    if let Ok(response) = facilitator.verify()
        && Some(true) == response.is_valid
        && let Ok(content) = db.get_content(&payload.file)
    {
        actix_web::rt::spawn(async move { facilitator.settle() });

        // Get Audio Sample
        let sample = content[payload.offset..payload.offset + payload.length].to_vec();
        return ResultAPI::verified_payment(sample);
    };

    ResultAPI::payment_required(request)
}

/// The request to set a content
#[derive(Debug, MultipartForm)]
pub struct SetContentRequest {
    /// The content to set
    pub content: TempFile,
}

/// The set content endpoint
#[post("/content")]
async fn set_content(
    form: MultipartForm<SetContentRequest>,
    db: web::ThinData<MemoryDB>,
) -> impl Responder {
    let mut content = form.content.file.as_file();
    let mut buffer = vec![0u8; form.content.size];

    if let Err(e) = content.read_exact(&mut buffer) {
        tracing::error!("Failed to read content: {e:?}");
        return ResultAPI::failure("Failed to read content");
    };

    let Ok(key) = db.set_content(buffer) else {
        return ResultAPI::failure("Content not set");
    };

    ResultAPI::okay(key)
}
