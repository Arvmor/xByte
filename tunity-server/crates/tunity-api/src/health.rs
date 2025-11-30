use crate::utils::{API_VERSION, ResultAPI};
use crate::x402;
use actix_web::dev::HttpServiceFactory;
use actix_web::web;
use actix_web::{Responder, get};

/// The Health Routes
#[derive(Debug)]
pub enum HealthRoute {
    /// The health check status endpoint
    Status,
    /// The index endpoint
    Index,
    /// The payable endpoint
    Payable,
}

/// The health check status endpoint
#[get("/health")]
async fn health() -> impl Responder {
    ResultAPI::success("OK")
}

/// The index endpoint
#[get("/")]
async fn index() -> impl Responder {
    ResultAPI::success(API_VERSION)
}

impl HttpServiceFactory for HealthRoute {
    fn register(self, config: &mut actix_web::dev::AppService) {
        match self {
            Self::Status => health.register(config),
            Self::Index => index.register(config),
            Self::Payable => payable.register(config),
        }
    }
}

#[get("/payable")]
async fn payable(
    state: web::Data<x402::ConfigX402>,
    auth: Option<x402::PaymentExtractor>,
) -> impl Responder {
    let config = &state.config;
    let requirement = openlibx402_actix::PaymentRequirement::new("1000")
        .with_description("Access to the basic tier");
    let payload =
        openlibx402_actix::create_payment_request(config, &requirement, "http://localhost/payable");

    // Return payment request
    let request = x402::X402Response::from((config.clone(), payload));

    // Check received payment
    let Some(payment) = auth else {
        return ResultAPI::payment_required(request);
    };

    // Verify and settle the payment
    let facilitator = x402::FacilitatorRequest::new(payment, request.accepts[0].clone());
    if let Ok(response) = facilitator.verify()
        && response.success
    {
        actix_web::rt::spawn(async move { facilitator.settle() });
        return ResultAPI::verified_payment("Access granted to basic tier");
    };

    ResultAPI::payment_required(request)
}
