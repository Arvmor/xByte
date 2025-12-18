use crate::utils::calculate_range_header;
use aws_sdk_s3::Client;
use aws_sdk_s3::presigning::{PresignedRequest, PresigningConfig};
use std::time::Duration;

/// A client for the xByte S3 handling the presigned requests
#[derive(Debug)]
pub struct XByteS3(Client);

impl XByteS3 {
    /// Create a new xByte S3 client
    pub async fn new() -> Self {
        let config = aws_config::load_from_env().await;
        let client = Client::new(&config);

        Self(client)
    }

    /// Get a presigned request for a range of a file
    pub async fn get_range(
        &self,
        bucket: &str,
        key: &str,
        offset: u64,
        len: u64,
        expires_in: Duration,
    ) -> anyhow::Result<PresignedRequest> {
        let config = PresigningConfig::expires_in(expires_in)?;
        let range = calculate_range_header(offset, len).ok_or(anyhow::anyhow!("range overflow"))?;

        let req = self
            .0
            .get_object()
            .bucket(bucket)
            .key(key)
            .range(range)
            .presigned(config)
            .await?;

        Ok(req)
    }
}
