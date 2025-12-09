use std::collections::HashMap;
use std::sync::{Arc, RwLock};
use uuid::Uuid;

/// A trait for a database
pub trait Database {
    /// The price type
    type Price;
    /// The bytes type
    type Content;
    /// The key type
    type Key;
    /// Set the price
    fn set_price(&self, key: &Self::Key, price: Self::Price) -> anyhow::Result<()>;
    /// Get the price
    fn get_price(&self, key: &Self::Key) -> anyhow::Result<Self::Price>;
    /// Set content
    fn set_content(&self, content: Self::Content) -> anyhow::Result<Self::Key>;
    /// Get content
    fn get_content(&self, key: &Self::Key) -> anyhow::Result<Self::Content>;
}

/// In-memory database
#[derive(Debug, Default, Clone)]
pub struct MemoryDB {
    prices: Arc<RwLock<HashMap<Uuid, u64>>>,
    contents: Arc<RwLock<HashMap<Uuid, Vec<u8>>>>,
}

impl Database for MemoryDB {
    type Price = u64;
    type Content = Vec<u8>;
    type Key = Uuid;

    fn set_price(&self, key: &Self::Key, price: Self::Price) -> anyhow::Result<()> {
        // Check if the content exists
        if self.contents.read().unwrap().get(key).is_none() {
            return Err(anyhow::anyhow!("Content not found"));
        }

        // Set the price
        let mut db = self.prices.write().unwrap();
        db.insert(*key, price);

        Ok(())
    }

    fn get_price(&self, key: &Self::Key) -> anyhow::Result<Self::Price> {
        let db = self.prices.read().unwrap();
        let result = db.get(key).ok_or(anyhow::anyhow!("Price not found"))?;

        Ok(*result)
    }

    fn set_content(&self, content: Self::Content) -> anyhow::Result<Self::Key> {
        let mut db = self.contents.write().unwrap();
        let key = Uuid::new_v4();
        db.insert(key, content);

        Ok(key)
    }

    fn get_content(&self, key: &Self::Key) -> anyhow::Result<Self::Content> {
        let db = self.contents.read().unwrap();
        let result = db.get(key).ok_or(anyhow::anyhow!("Content not found"))?;

        Ok(result.clone())
    }
}
