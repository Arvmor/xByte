use crate::ResultAPI;
use crate::utils;
use crate::x402::{ConfigX402, FacilitatorRequest, PaymentExtractor, PaymentRequest, X402Response};
use actix_web::Responder;
use actix_web::dev::HttpServiceFactory;
use actix_web::{HttpRequest, post, web};
use serde::Deserialize;

/// The Player Routes
#[derive(Debug)]
pub enum PlayerRoute {
    /// The play endpoint
    Play,
}

impl HttpServiceFactory for PlayerRoute {
    fn register(self, config: &mut actix_web::dev::AppService) {
        match self {
            Self::Play => play.register(config),
        }
    }
}

/// The request to play a sample
#[derive(Debug, Deserialize)]
pub struct PlayRequest {
    /// The file to play
    pub file: String,
    /// The offset to start playing from
    pub offset: u64,
    /// The length of the sample to play
    pub length: usize,
}

/// The play endpoint
#[post("/play")]
async fn play(
    request: HttpRequest,
    config: web::Data<ConfigX402<&'static str>>,
    payload: web::Json<PlayRequest>,
    auth: Option<PaymentExtractor>,
) -> impl Responder {
    let url = request.full_url();
    let req = PaymentRequest::new(&config, "1000", "Access to play the track", url);
    let request = X402Response::new(&[req]);

    // Check received payment
    let Some(payment) = auth else {
        return ResultAPI::payment_required(request);
    };

    // Verify and settle the payment
    let facilitator = FacilitatorRequest::new(payment, request.accepts[0].clone());
    if let Ok(response) = facilitator.verify()
        && Some(true) == response.is_valid
        && let Ok(audio_sample) = utils::get_chunk(&*payload.file, payload.offset, payload.length)
    {
        actix_web::rt::spawn(async move { facilitator.settle() });

        // Get Audio Sample
        return ResultAPI::verified_payment(audio_sample.to_vec());
    };

    ResultAPI::payment_required(request)
}
