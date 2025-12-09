use crate::utils::{API_VERSION, ResultAPI};
use actix_web::dev::HttpServiceFactory;
use actix_web::{Responder, get};

/// The Health Routes
#[derive(Debug)]
pub enum HealthRoute {
    /// The health check status endpoint
    Status,
    /// The index endpoint
    Index,
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
        }
    }
}
