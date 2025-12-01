use crate::ResultAPI;
use crate::x402::{ConfigX402, FacilitatorRequest, PaymentExtractor, X402Response};
use actix_web::dev::HttpServiceFactory;
use actix_web::{HttpRequest, web};
use actix_web::{Responder, get};
use openlibx402_actix::{PaymentRequirement, create_payment_request};

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

/// The play endpoint
#[get("/play")]
async fn play(
    request: HttpRequest,
    state: web::Data<ConfigX402>,
    auth: Option<PaymentExtractor>,
) -> impl Responder {
    let config = state.config.clone();
    let req = PaymentRequirement::new("1000").with_description("Access to play the track");
    let payload = create_payment_request(&config, &req, request.full_url().as_str());

    // Check received payment
    let request = X402Response::from((config, payload));
    let Some(payment) = auth else {
        return ResultAPI::payment_required(request);
    };

    // Verify and settle the payment
    let facilitator = FacilitatorRequest::new(payment, request.accepts[0].clone());
    if let Ok(response) = facilitator.verify()
        && Some(true) == response.is_valid
        && let Ok(audio_sample) = get_audio_sample()
    {
        actix_web::rt::spawn(async move { facilitator.settle() });

        // Get Audio Sample
        return ResultAPI::verified_payment(audio_sample);
    };

    ResultAPI::payment_required(request)
}

fn get_audio_sample() -> anyhow::Result<Vec<u8>> {
    const SAMPLE_DURATION_SECONDS: usize = 3;
    const FRAMES_PER_SECOND: usize = 38;
    const TOTAL_FRAMES: usize = SAMPLE_DURATION_SECONDS * FRAMES_PER_SECOND;

    let mut sample = Vec::new();

    for _ in 0..TOTAL_FRAMES {
        sample.extend_from_slice(&[0xFF, 0xFB, 0x90, 0x00]);

        let frame_size: usize = 417;
        for i in 0..frame_size.saturating_sub(4) {
            sample.push((i % 256) as u8);
        }
    }

    Ok(sample)
}
