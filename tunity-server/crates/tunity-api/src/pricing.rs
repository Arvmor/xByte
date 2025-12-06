use crate::ResultAPI;
use actix_web::Responder;
use actix_web::dev::HttpServiceFactory;
use actix_web::{get, post};

/// The Pricing Routes
#[derive(Debug)]
pub enum PricingRoute {
    /// The set price endpoint
    SetPrice,
    /// The get price endpoint
    GetPrice,
}

impl HttpServiceFactory for PricingRoute {
    fn register(self, config: &mut actix_web::dev::AppService) {
        match self {
            Self::SetPrice => set_price.register(config),
            Self::GetPrice => get_price.register(config),
        }
    }
}

#[post("/price")]
async fn set_price() -> impl Responder {
    ResultAPI::success("Price set")
}

#[get("/price")]
async fn get_price() -> impl Responder {
    ResultAPI::success("Price get")
}
