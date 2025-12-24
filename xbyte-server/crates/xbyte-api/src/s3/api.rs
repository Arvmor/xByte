use crate::{ResultAPI, XByteS3};
use actix_web::dev::HttpServiceFactory;
use actix_web::{Responder, get, web};
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
}

impl HttpServiceFactory for S3Route {
    fn register(self, config: &mut actix_web::dev::AppService) {
        match self {
            Self::GetAllBuckets => get_all_buckets.register(config),
            Self::GetAllObjects => get_all_objects.register(config),
            Self::GetObject => get_object.register(config),
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
) -> impl Responder {
    let (bucket, object) = path.into_inner();
    let RangeRequest { offset, length } = range.into_inner();

    // Get the range of the object
    let data = match s3.get_range(&bucket, &object, offset, length).await {
        Ok(data) => data,
        Err(error) => return ResultAPI::failure(error.to_string()),
    };

    ResultAPI::okay(data.into_bytes())
}
