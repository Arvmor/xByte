use crate::Client;
use std::collections::HashMap;
use std::sync::{Arc, RwLock};
use uuid::Uuid;

/// A trait for a database
pub trait Database {
    /// The price key type
    type KeyPrice;
    /// The price type
    type Price;
    /// The client key type
    type KeyClient;
    /// The client type
    type Client;
    /// The bucket key type
    type KeyBucket;
    /// The bucket type
    type Bucket;

    /// Set the price
    fn set_price(&self, key: Self::KeyPrice, price: Self::Price) -> anyhow::Result<()>;
    /// Get the price
    fn get_price(&self, key: &Self::KeyPrice) -> anyhow::Result<Self::Price>;
    /// Set client
    fn set_client(&self, key: Self::KeyClient, client: Self::Client) -> anyhow::Result<bool>;
    /// Get client
    fn get_client(&self, key: &Self::KeyClient) -> anyhow::Result<Self::Client>;
    /// Assign Bucket to Client
    fn assign_bucket(&self, key: Self::KeyBucket, client: Self::KeyClient) -> anyhow::Result<()>;
    /// Get Bucket from Client
    fn get_bucket(&self, key: &Self::KeyBucket) -> anyhow::Result<Self::Bucket>;
}

/// In-memory database
#[derive(Debug, Default, Clone)]
pub struct MemoryDB {
    prices: Arc<RwLock<HashMap<(String, String), u64>>>,
    clients: Arc<RwLock<HashMap<Uuid, Client>>>,
    buckets: Arc<RwLock<HashMap<String, Uuid>>>,
}

impl Database for MemoryDB {
    type KeyPrice = (String, String);
    type Price = u64;
    type KeyClient = Uuid;
    type Client = Client;
    type KeyBucket = String;
    type Bucket = Uuid;

    fn set_price(&self, key: Self::KeyPrice, price: Self::Price) -> anyhow::Result<()> {
        // Set the price
        let mut db = self.prices.write().unwrap();
        db.insert(key, price);

        Ok(())
    }

    fn get_price(&self, key: &Self::KeyPrice) -> anyhow::Result<Self::Price> {
        let db = self.prices.read().unwrap();
        let result = db.get(key).ok_or(anyhow::anyhow!("Price not found"))?;

        Ok(*result)
    }

    fn set_client(&self, key: Self::KeyClient, client: Self::Client) -> anyhow::Result<bool> {
        let mut db = self.clients.write().unwrap();
        let result = db.insert(key, client);
        Ok(result.is_some())
    }

    fn get_client(&self, key: &Self::KeyClient) -> anyhow::Result<Self::Client> {
        let db = self.clients.read().unwrap();
        let result = db.get(key).ok_or(anyhow::anyhow!("Client not found"))?;

        Ok(result.clone())
    }

    fn assign_bucket(&self, key: Self::KeyBucket, client: Self::KeyClient) -> anyhow::Result<()> {
        let mut db = self.buckets.write().unwrap();
        db.insert(key, client);

        Ok(())
    }

    fn get_bucket(&self, key: &Self::KeyBucket) -> anyhow::Result<Self::Bucket> {
        let db = self.buckets.read().unwrap();
        let result = db.get(key).ok_or(anyhow::anyhow!("Bucket not found"))?;

        Ok(*result)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_assign_bucket() -> anyhow::Result<()> {
        let db = MemoryDB::default();
        let client = Client::new("test", Default::default());

        let bucket_key = String::from("test_bucket");
        db.assign_bucket(bucket_key, client.id.unwrap())?;
        Ok(())
    }

    #[test]
    fn test_assign_bucket_roundtrip() -> anyhow::Result<()> {
        let db = MemoryDB::default();
        let client = Client::new("test".to_string(), Default::default());
        db.set_client(client.id.unwrap(), client.clone())?;

        let bucket_key = String::from("test_bucket");
        db.assign_bucket(bucket_key.clone(), client.id.unwrap())?;

        let bucket_info = db.get_bucket(&bucket_key)?;
        let client_fetched = db.get_client(&bucket_info)?;
        assert_eq!(client_fetched, client);
        Ok(())
    }
}
