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
    auth: Option<openlibx402_actix::PaymentExtractor>,
) -> impl Responder {
    match auth {
        // Payment verified
        Some(_) => ResultAPI::verified_payment("Access granted to basic tier"),
        // No payment, return 402
        None => {
            let requirement = openlibx402_actix::PaymentRequirement::new("0.01")
                .with_description("Access to basic tier data");
            let payment_request =
                openlibx402_actix::create_payment_request(&state.config, &requirement, "/payable");

            ResultAPI::payment_required(payment_request)
        }
    }
}
