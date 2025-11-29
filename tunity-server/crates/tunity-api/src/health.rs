use crate::utils::{API_VERSION, ResultAPI};
use actix_web::{Responder, dev::HttpServiceFactory};

pub struct HealthRoute;

impl HealthRoute {
    /// The health check status endpoint
    pub fn status() -> impl HttpServiceFactory {
        health
    }
    /// The index endpoint
    pub fn index() -> impl HttpServiceFactory {
        index
    }
}

/// The health check status endpoint
#[actix_web::get("/health")]
async fn health() -> impl Responder {
    ResultAPI::success("OK")
}

/// The index endpoint
#[actix_web::get("/")]
async fn index() -> impl Responder {
    ResultAPI::success(API_VERSION)
}
