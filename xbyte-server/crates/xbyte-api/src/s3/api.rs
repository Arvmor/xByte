use crate::{ConfigX402, Database, MemoryDB, ResultAPI, Storage, XByteS3, utils, x402};
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
async fn get_all_buckets(
    sts: web::ThinData<aws_sdk_sts::Client>,
    db: web::ThinData<MemoryDB>,
) -> impl Responder {
    let mut buckets = Vec::new();

    let storages = match db.get_all_storages() {
        Ok(s) => s,
        Err(error) => {
            tracing::error!(?error, "Failed to get all clients");
            return ResultAPI::failure("Failed to get all clients");
        }
    };

    for storage in storages {
        let s3 = match XByteS3::new_assumed_role(
            &sts,
            storage.role_arn(),
            "xbyte-s3",
            storage.region().clone(),
        )
        .await
        {
            Ok(s3) => s3,
            Err(error) => {
                tracing::error!(?error, "Failed to create S3 client");
                continue;
            }
        };

        let objects = match s3.list_buckets().await {
            Ok(o) => o,
            Err(error) => {
                tracing::error!(?error, "Error listing buckets");
                return ResultAPI::failure("Failed to list buckets");
            }
        };

        buckets.extend(objects.into_iter().filter_map(|b| b.name));
    }

    ResultAPI::okay(buckets)
}

#[get("/s3/bucket/{bucket}/objects")]
async fn get_all_objects(
    sts: web::ThinData<aws_sdk_sts::Client>,
    bucket: web::Path<String>,
    db: web::ThinData<MemoryDB>,
) -> impl Responder {
    // Get the bucket owner
    let client = match db
        .get_bucket(&bucket)
        .and_then(|a| db.get_client(&a))
        .map(|c| c.storage)
    {
        Ok(Some(storage)) => storage,
        Ok(_) => {
            tracing::error!("Bucket owner not found");
            panic!("Bucket owner not found");
        }
        Err(error) => {
            tracing::error!(?error, "Failed to get bucket owner");
            return ResultAPI::failure("Failed to get bucket owner");
        }
    };

    let s3 = match XByteS3::new_assumed_role(
        &sts,
        client.role_arn(),
        "xbyte-s3",
        client.region().clone(),
    )
    .await
    {
        Ok(s3) => s3,
        Err(error) => {
            tracing::error!(?error, "Failed to create S3 client");
            return ResultAPI::failure("Failed to create S3 client");
        }
    };

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
    sts: web::ThinData<aws_sdk_sts::Client>,
    path: web::Path<(String, String)>,
    range: web::Query<RangeRequest>,
    request: HttpRequest,
    db: web::ThinData<MemoryDB>,
    config: web::Data<ConfigX402<&'static str>>,
    auth: Option<x402::PaymentExtractor>,
) -> impl Responder {
    let url = request.full_url();
    let RangeRequest { offset, length } = range.into_inner();

    let (pay_to, storage) = match db
        .get_bucket(&path.0)
        .and_then(|c| db.get_client(&c))
        .map(|c| (c.vault, c.storage))
    {
        Ok((Some(vault), Some(s))) => (vault.to_string(), s),
        Ok(_) => {
            tracing::error!("Bucket owner not found");
            panic!("Bucket owner not found");
        }
        Err(error) => {
            tracing::error!(?error, "Failed to get bucket owner");
            panic!("Failed to get bucket owner");
        }
    };

    // Get the price in USDC / 1MB
    let price = db.get_price(&path).unwrap_or(1000);
    let total_price = utils::calculate_price(price as f32, length as f32).to_string();

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
    let s3 = match XByteS3::new_assumed_role(
        &sts,
        storage.role_arn(),
        "xbyte-s3",
        storage.region().clone(),
    )
    .await
    {
        Ok(s3) => s3,
        Err(error) => {
            tracing::error!(?error, "Failed to create S3 client");
            return ResultAPI::payment_required(request);
        }
    };

    // Get the range of the object
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
    /// The storage information
    pub storage: Storage<String>,
    /// The client ID
    pub client: alloy_primitives::Address,
}

#[post("/s3/register")]
async fn register_bucket(
    db: web::ThinData<MemoryDB>,
    sts: web::ThinData<aws_sdk_sts::Client>,
    web::Json(payload): web::Json<RegisterRequest>,
) -> impl Responder {
    let s3 = match XByteS3::new_assumed_role(
        &sts,
        payload.storage.role_arn(),
        "xbyte",
        payload.storage.region().clone(),
    )
    .await
    {
        Ok(s3) => s3,
        Err(error) => {
            tracing::error!(?error, "Failed to create S3 client");
            return ResultAPI::failure("Failed to create S3 client");
        }
    };

    // Map bucket to client
    let buckets = match s3.list_buckets().await {
        Ok(b) => b,
        Err(error) => {
            tracing::error!(?error, "Failed to list buckets");
            return ResultAPI::failure("Failed to list buckets");
        }
    };

    for bucket in buckets {
        if let Err(error) = db.assign_bucket(bucket.name.unwrap(), payload.client) {
            tracing::error!(?error, "Failed to assign bucket to client");
            return ResultAPI::failure("Failed to assign bucket to client");
        }
    }

    // Assign storage to client
    if let Err(error) = db.assign_storage(payload.client, payload.storage) {
        tracing::error!(?error, "Failed to register storage");
        return ResultAPI::failure("Failed to register storage");
    };

    ResultAPI::okay("Storage registered successfully")
}
