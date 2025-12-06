use std::collections::HashMap;
use std::sync::{Arc, RwLock};

/// A trait for a database
pub trait Database {
    /// The price type
    type Price;
    /// The bytes type
    type Content;
    /// The key type
    type Key;
    /// Set the price
    fn set_price(&self, price: Self::Price) -> anyhow::Result<Self::Key>;
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
    prices: Arc<RwLock<HashMap<String, String>>>,
    contents: Arc<RwLock<HashMap<String, Vec<u8>>>>,
}

impl Database for MemoryDB {
    type Price = String;
    type Content = Vec<u8>;
    type Key = String;

    fn set_price(&self, price: Self::Price) -> anyhow::Result<Self::Key> {
        let mut db = self.prices.write().unwrap();
        let key = db.len().to_string();
        db.insert(key.clone(), price);

        Ok(key)
    }

    fn get_price(&self, key: &Self::Key) -> anyhow::Result<Self::Price> {
        let db = self.prices.read().unwrap();
        let result = db.get(key).ok_or(anyhow::anyhow!("Price not found"))?;

        Ok(result.clone())
    }

    fn set_content(&self, content: Self::Content) -> anyhow::Result<Self::Key> {
        let mut db = self.contents.write().unwrap();
        let key = db.len().to_string();
        db.insert(key.clone(), content);

        Ok(key)
    }

    fn get_content(&self, key: &Self::Key) -> anyhow::Result<Self::Content> {
        let db = self.contents.read().unwrap();
        let result = db.get(key).ok_or(anyhow::anyhow!("Content not found"))?;

        Ok(result.clone())
    }
}
