use crate::{Database, MemoryDB, ResultAPI};
use actix_web::Responder;
use actix_web::dev::HttpServiceFactory;
use actix_web::{get, post, web};
use serde::Deserialize;
use uuid::Uuid;

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

/// The request to set a price
#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SetPriceRequest {
    /// The key to set the price for
    pub key: Uuid,
    /// The price to set
    pub price: u64,
}

#[post("/price")]
async fn set_price(
    payload: web::Json<SetPriceRequest>,
    db: web::ThinData<MemoryDB>,
) -> impl Responder {
    let payload = payload.into_inner();
    match db.set_price(&payload.key, payload.price) {
        Ok(key) => ResultAPI::okay(key),
        Err(e) => {
            tracing::error!("Error setting price: {e:?}");
            ResultAPI::failure("Price not set")
        }
    }
}

#[get("/price/{key}")]
async fn get_price(key: web::Path<String>, db: web::ThinData<MemoryDB>) -> impl Responder {
    // Parse the key as a UUID
    let Ok(key) = Uuid::parse_str(key.as_str()) else {
        return ResultAPI::failure("Invalid key");
    };

    // Get the price
    match db.get_price(&key) {
        Ok(price) => ResultAPI::okay(price),
        Err(e) => {
            tracing::error!("Error getting price: {e:?}");
            ResultAPI::failure("Price not found")
        }
    }
}
