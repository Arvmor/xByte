use crate::{Client, Storage};
use alloy_primitives::Address;
use std::collections::HashMap;
use std::sync::{Arc, RwLock};

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
    /// The storage type
    type Storage;

    /// Set the price
    fn set_price(&self, key: Self::KeyPrice, price: Self::Price) -> anyhow::Result<()>;
    /// Get the price
    fn get_price(&self, key: &Self::KeyPrice) -> anyhow::Result<Self::Price>;
    /// Set client
    fn set_client(&self, key: Self::KeyClient, client: Self::Client) -> anyhow::Result<bool>;
    /// Get client
    fn get_client(&self, key: &Self::KeyClient) -> anyhow::Result<Self::Client>;
    /// Get all clients
    fn get_all_clients(&self) -> anyhow::Result<Vec<Self::Client>>;
    /// Assign Bucket to Client
    fn assign_bucket(&self, key: Self::KeyBucket, client: Self::KeyClient) -> anyhow::Result<()>;
    /// Get Bucket from Client
    fn get_bucket(&self, key: &Self::KeyBucket) -> anyhow::Result<Self::Bucket>;
    /// Assign Storage to Client
    fn assign_storage(&self, key: Self::KeyClient, storage: Self::Storage) -> anyhow::Result<()>;
    /// Get Storage from Client
    fn get_storage(&self, key: &Self::KeyClient) -> anyhow::Result<Self::Storage>;
}

/// In-memory database
#[derive(Debug, Default, Clone)]
pub struct MemoryDB {
    prices: Arc<RwLock<HashMap<(String, String), u64>>>,
    clients: Arc<RwLock<HashMap<Address, Client>>>,
    buckets: Arc<RwLock<HashMap<String, Address>>>,
}

impl Database for MemoryDB {
    type KeyPrice = (String, String);
    type Price = u64;
    type KeyClient = Address;
    type Client = Client;
    type KeyBucket = String;
    type Bucket = Address;
    type Storage = Storage<String>;

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

    fn get_all_clients(&self) -> anyhow::Result<Vec<Self::Client>> {
        let db = self.clients.read().unwrap();
        let result = db.values().cloned().collect();

        Ok(result)
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

    fn assign_storage(&self, key: Self::KeyClient, storage: Self::Storage) -> anyhow::Result<()> {
        let mut db = self.clients.write().unwrap();
        match db.get_mut(&key) {
            Some(c) => c.storage = Some(storage),
            None => return Err(anyhow::anyhow!("Client not found")),
        }

        Ok(())
    }

    fn get_storage(&self, key: &Self::KeyClient) -> anyhow::Result<Self::Storage> {
        let db = self.clients.read().unwrap();
        let result = db
            .get(key)
            .and_then(|c| c.storage.clone())
            .ok_or(anyhow::anyhow!("Storage not found"))?;

        Ok(result)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use alloy_primitives::address;

    const TEST_WALLET: Address = address!("1234567890123456789012345678901234567890");

    #[test]
    fn test_assign_bucket() -> anyhow::Result<()> {
        let db = MemoryDB::default();
        let client = Client::new("test", TEST_WALLET);

        let bucket_key = String::from("test_bucket");
        db.assign_bucket(bucket_key, client.id.unwrap())?;
        Ok(())
    }

    #[test]
    fn test_assign_bucket_roundtrip() -> anyhow::Result<()> {
        let db = MemoryDB::default();
        let client = Client::new("test".to_string(), TEST_WALLET);
        db.set_client(client.id.unwrap(), client.clone())?;

        let bucket_key = String::from("test_bucket");
        db.assign_bucket(bucket_key.clone(), client.id.unwrap())?;

        let bucket_info = db.get_bucket(&bucket_key)?;
        let client_fetched = db.get_client(&bucket_info)?;
        assert_eq!(client_fetched, client);
        Ok(())
    }

    #[test]
    fn test_assign_storage() -> anyhow::Result<()> {
        let db = MemoryDB::default();
        let client = Client::new(Default::default(), TEST_WALLET);
        db.set_client(client.id.unwrap(), client.clone())?;

        let storage = Storage::S3 {
            role_arn: Default::default(),
            region: Default::default(),
        };

        db.assign_storage(client.id.unwrap(), storage)?;
        Ok(())
    }

    #[test]
    fn test_assign_storage_roundtrip() -> anyhow::Result<()> {
        let db = MemoryDB::default();
        let client = Client::new("test".to_string(), TEST_WALLET);
        db.set_client(client.id.unwrap(), client.clone())?;

        let storage = Storage::S3 {
            role_arn: Default::default(),
            region: Default::default(),
        };

        db.assign_storage(client.id.unwrap(), storage.clone())?;

        let storage_info = db.get_storage(&client.id.unwrap())?;
        assert_eq!(storage_info, storage);
        Ok(())
    }
}
