use crate::{ResultAPI, XByteS3};
use actix_web::dev::HttpServiceFactory;
use actix_web::{Responder, get, web};

/// The S3 Routes
#[derive(Debug)]
pub enum S3Route {
    /// The get all buckets endpoint
    GetAllBuckets,
    /// The get all objects endpoint
    GetAllObjects,
}

impl HttpServiceFactory for S3Route {
    fn register(self, config: &mut actix_web::dev::AppService) {
        match self {
            Self::GetAllBuckets => get_all_buckets.register(config),
            Self::GetAllObjects => get_all_objects.register(config),
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

#[get("/s3/{bucket}/objects")]
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
