use crate::x402::{ConfigX402, FacilitatorRequest, PaymentExtractor, PaymentRequest, X402Response};
use crate::{Database, MemoryDB, ResultAPI};
use crate::{s3, utils};
use actix_multipart::form::MultipartForm;
use actix_multipart::form::tempfile::TempFile;
use actix_web::Responder;
use actix_web::dev::HttpServiceFactory;
use actix_web::{HttpRequest, post, web};
use serde::Deserialize;
use std::io::Read;
use uuid::Uuid;

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
    /// The key to play
    pub key: Uuid,
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
    s3: web::ThinData<s3::XByteS3>,
    config: web::Data<ConfigX402<&'static str>>,
    payload: web::Json<PlayRequest>,
    auth: Option<PaymentExtractor>,
) -> impl Responder {
    let url = request.full_url();
    // Get the price in USDC / 1MB
    let price = db.get_price(&payload.key).unwrap_or(1000);
    let total_price = utils::calculate_price(price as f32, payload.length as f32);
    let req = PaymentRequest::new(
        &config,
        total_price.to_string(),
        "Access to play the track",
        url,
    );

    // Check received payment
    let request = X402Response::new(&[req]);
    let Some(payment) = auth else {
        return ResultAPI::payment_required(request);
    };

    // Verify and settle the payment
    let facilitator = FacilitatorRequest::new(payment, request.accepts[0].clone());
    if let Ok(response) = facilitator.verify()
        && Some(true) == response.is_valid
        && let Ok(bytes) = s3
            .get_range(
                "xbyte-runtime",
                &payload.key.to_string(),
                payload.offset as u64,
                payload.length as u64,
            )
            .await
    {
        actix_web::rt::spawn(async move { facilitator.settle() });

        return ResultAPI::verified_payment(bytes.to_vec());
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

    if let Err(error) = content.read_exact(&mut buffer) {
        tracing::error!(?error, "Failed to read content");
        return ResultAPI::failure("Failed to read content");
    };

    let Ok(key) = db.set_content(buffer) else {
        tracing::error!(?form.content, "Failed to set content");
        return ResultAPI::failure("Content not set");
    };

    ResultAPI::okay(key)
}
