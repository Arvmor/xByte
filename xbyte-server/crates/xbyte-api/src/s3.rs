use crate::utils;
use aws_sdk_s3::Client;
use aws_sdk_s3::primitives::AggregatedBytes;

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
}
