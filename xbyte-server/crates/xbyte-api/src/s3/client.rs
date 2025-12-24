use crate::utils;
use aws_sdk_s3::Client;
use aws_sdk_s3::primitives::AggregatedBytes;
use aws_sdk_s3::types::{Bucket, Object};

/// A client for the xByte S3 handling the presigned requests
#[derive(Debug, Clone)]
pub struct XByteS3(Client);

impl XByteS3 {
    /// Create a new xByte S3 client
    pub async fn new() -> Self {
        let config = aws_config::load_from_env().await;
        Self(Client::new(&config))
    }

    /// Get a presigned request for a range of a file
    pub async fn get_range(
        &self,
        bucket: &str,
        key: &str,
        offset: u64,
        len: u64,
    ) -> anyhow::Result<AggregatedBytes> {
        let range =
            utils::calculate_range_header(offset, len).ok_or(anyhow::anyhow!("range overflow"))?;

        let req = self
            .0
            .get_object()
            .bucket(bucket)
            .key(key)
            .range(range)
            .send()
            .await?;

        let data = req.body.collect().await?;

        Ok(data)
    }

    /// List all Buckets
    pub async fn list_buckets(&self) -> anyhow::Result<Vec<Bucket>> {
        let req = self.0.list_buckets().send().await?;
        let buckets = req.buckets.ok_or(anyhow::anyhow!("no buckets found"))?;

        Ok(buckets)
    }

    /// List all objects in a bucket
    pub async fn list_objects(&self, bucket: &str) -> anyhow::Result<Vec<Object>> {
        let req = self.0.list_objects().bucket(bucket).send().await?;
        let objects = req.contents.ok_or(anyhow::anyhow!("no objects found"))?;

        Ok(objects)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[actix_web::test]
    async fn test_list_buckets() -> anyhow::Result<()> {
        dotenv::dotenv().ok();

        // Create a new client
        let client = XByteS3::new().await;
        let buckets = client.list_buckets().await;

        // Verify the data
        assert!(buckets.is_ok());
        Ok(())
    }

    #[actix_web::test]
    async fn test_list_objects() -> anyhow::Result<()> {
        dotenv::dotenv().ok();

        // Create a new client
        let client = XByteS3::new().await;
        let buckets = client.list_buckets().await?;
        let Some(bucket_name) = buckets.into_iter().next().and_then(|f| f.name) else {
            return Ok(());
        };

        // List objects in the bucket
        let objects = client.list_objects(&bucket_name).await;
        assert!(objects.is_ok());
        Ok(())
    }
}
