use crate::{ConfigX402, Database, MemoryDB, ResultAPI, XByteS3, utils, x402};
use actix_web::dev::HttpServiceFactory;
use actix_web::{HttpRequest, Responder, get, post, web};
use serde::{Deserialize, Serialize};

/// The S3 Routes
#[derive(Debug)]
pub enum S3Route {
    /// The get all buckets endpoint
    GetAllBuckets,
    /// The get all objects endpoint
    GetAllObjects,
    /// The get object endpoint
    GetObject,
    /// The register bucket endpoint
    RegisterBucket,
}

impl HttpServiceFactory for S3Route {
    fn register(self, config: &mut actix_web::dev::AppService) {
        match self {
            Self::GetAllBuckets => get_all_buckets.register(config),
            Self::GetAllObjects => get_all_objects.register(config),
            Self::GetObject => get_object.register(config),
            Self::RegisterBucket => register_bucket.register(config),
        }
    }
}

#[get("/s3/bucket")]
async fn get_all_buckets(s3: web::ThinData<XByteS3>) -> impl Responder {
    let objects = match s3.list_buckets().await {
        Ok(objects) => objects,
        Err(error) => {
            tracing::error!(?error, "Error listing buckets");
            return ResultAPI::failure("Failed to list buckets");
        }
    };

    let names = objects
        .into_iter()
        .filter_map(|b| b.name)
        .collect::<Vec<_>>();

    ResultAPI::okay(names)
}

#[get("/s3/bucket/{bucket}/objects")]
async fn get_all_objects(s3: web::ThinData<XByteS3>, bucket: web::Path<String>) -> impl Responder {
    let objects = match s3.list_objects(&bucket).await {
        Ok(objects) => objects,
        Err(error) => {
            tracing::error!(?error, "Error listing objects");
            return ResultAPI::failure("Failed to list objects");
        }
    };

    let names = objects
        .into_iter()
        .filter_map(|o| o.key)
        .collect::<Vec<_>>();

    ResultAPI::okay(names)
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RangeRequest {
    /// The offset to start the range from
    pub offset: u64,
    /// The length of the range
    pub length: u64,
}

#[get("/s3/bucket/{bucket}/object/{object}")]
async fn get_object(
    s3: web::ThinData<XByteS3>,
    path: web::Path<(String, String)>,
    range: web::Query<RangeRequest>,
    request: HttpRequest,
    db: web::ThinData<MemoryDB>,
    config: web::Data<ConfigX402<&'static str>>,
    auth: Option<x402::PaymentExtractor>,
) -> impl Responder {
    let url = request.full_url();
    let RangeRequest { offset, length } = range.into_inner();

    // Get the price in USDC / 1MB
    let price = db.get_price(&path).unwrap_or(1000);
    let total_price = utils::calculate_price(price as f32, length as f32).to_string();
    let pay_to = db
        .get_bucket(&path.0)
        .and_then(|c| db.get_client(&c))
        .map(|o| o.vault.unwrap().to_string())
        .unwrap_or_else(|error| {
            tracing::error!(?error, "Failed to get bucket owner");
            config.payment_address.to_string()
        });

    // Check received payment
    let req = x402::PaymentRequest::new(&config, pay_to, total_price, "Access the object", url);
    let request = x402::X402Response::new(&[req]);
    let Some(payment) = auth else {
        return ResultAPI::payment_required(request);
    };

    // Verify and settle the payment
    let facilitator = x402::FacilitatorRequest::new(payment, request.accepts[0].clone());
    match facilitator.verify() {
        Ok(response) if response.is_valid() => {
            tracing::info!(?response, "x402 Settlement started");
            actix_web::rt::spawn(async move { facilitator.settle() });
        }
        Ok(response) => {
            tracing::warn!(?response, "x402 Payment verification failed");
            return ResultAPI::payment_required(request);
        }
        Err(error) => {
            tracing::error!(?error, "Failed to verify x402 payment");
            return ResultAPI::payment_required(request);
        }
    }

    // Get the range of the object
    let (bucket, object) = path.into_inner();
    match s3.get_range(&bucket, &object, offset, length).await {
        Ok(data) => ResultAPI::okay(data.into_bytes()),
        Err(error) => {
            tracing::error!(?error, "Failed to get object range");
            ResultAPI::payment_required(request)
        }
    }
}

/// The request to register a bucket
#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RegisterRequest {
    /// The bucket
    pub bucket: String,
    /// The client ID
    pub client: uuid::Uuid,
}

#[post("/s3/register")]
async fn register_bucket(
    db: web::ThinData<MemoryDB>,
    web::Json(payload): web::Json<RegisterRequest>,
) -> impl Responder {
    if let Err(error) = db.assign_bucket(payload.bucket, payload.client) {
        tracing::error!(?error, "Failed to register bucket");
        return ResultAPI::failure("Failed to register bucket");
    };

    ResultAPI::okay("Bucket registered successfully")
}
