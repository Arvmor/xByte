use crate::utils;
use aws_config::{Region, SdkConfig};
use aws_sdk_s3::Client;
use aws_sdk_s3::config::Credentials;
use aws_sdk_s3::primitives::AggregatedBytes;
use aws_sdk_s3::types::{Bucket, Object};
use aws_sdk_sts::Client as StsClient;
use std::time::SystemTime;

/// A client for the xByte S3 handling the presigned requests
#[derive(Debug, Clone)]
pub struct XByteS3(Client, SdkConfig);

impl XByteS3 {
    /// Create a new xByte S3 client
    pub async fn new() -> Self {
        let config = aws_config::load_from_env().await;
        Self(Client::new(&config), config)
    }

    /// Create a new xByte S3 client by assuming a role in another account/org
    pub async fn new_assumed_role(
        self,
        role_arn: &str,
        session_name: &str,
        region: Region,
    ) -> anyhow::Result<Self> {
        let sts_client = StsClient::new(&self.1);

        let assumed_role = sts_client
            .assume_role()
            .role_arn(role_arn)
            .role_session_name(session_name)
            .send()
            .await?;

        let Some(cred) = assumed_role.credentials else {
            return Err(anyhow::anyhow!("no credentials returned from assume role"));
        };

        let credentials = Credentials::new(
            cred.access_key_id,
            cred.secret_access_key,
            Some(cred.session_token),
            Some(SystemTime::try_from(cred.expiration)?),
            "assumed-role",
        );

        let config = aws_sdk_s3::Config::builder()
            .credentials_provider(credentials)
            .region(region)
            .build();

        Ok(Self(Client::from_conf(config), self.1))
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
            eprintln!("No bucket found, skipping test");
            return Ok(());
        };

        // List objects in the bucket
        let objects = client.list_objects(&bucket_name).await;
        assert!(objects.is_ok());
        Ok(())
    }

    #[actix_web::test]
    async fn test_get_range() -> anyhow::Result<()> {
        dotenv::dotenv().ok();

        // Create a new client
        let client = XByteS3::new().await;
        let buckets = client.list_buckets().await?;
        let Some(bucket_name) = buckets.into_iter().next().and_then(|f| f.name) else {
            eprintln!("No bucket found, skipping test");
            return Ok(());
        };

        // List objects in the bucket
        let objects = client.list_objects(&bucket_name).await?;
        let Some(object_name) = objects.into_iter().next().and_then(|f| f.key) else {
            eprintln!("No object found, skipping test");
            return Ok(());
        };

        // Get the range
        let data = client.get_range(&bucket_name, &object_name, 0, 1337).await;
        assert!(data.is_ok());
        assert_eq!(data.unwrap().into_bytes().len(), 1337);
        Ok(())
    }

    #[actix_web::test]
    async fn test_new_assumed_role() -> anyhow::Result<()> {
        dotenv::dotenv().ok();
        const ROLE_ARN: &str = "arn:aws:iam::113586717446:role/S3AccessRoleCustom";
        const SESSION_NAME: &str = "test-session";
        let region = Region::new("us-east-1");

        // Create a new client
        let client = XByteS3::new().await;

        client
            .new_assumed_role(ROLE_ARN, SESSION_NAME, region)
            .await?;

        Ok(())
    }
}
