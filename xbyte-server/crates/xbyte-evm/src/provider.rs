use alloy_provider::{DynProvider, Provider, network::Ethereum};
use std::ops::Deref;

/// xByte EVM Client
#[derive(Debug, Clone)]
pub struct Client(DynProvider<Ethereum>);

impl Client {
    pub fn new(url: &str) -> anyhow::Result<Self> {
        let url = url.parse()?;
        let provider = DynProvider::builder().connect_http(url).erased();
        Ok(Self(provider))
    }
}

impl Provider for Client {
    fn root(&self) -> &alloy_provider::RootProvider<Ethereum> {
        self.0.root()
    }
}

impl Deref for Client {
    type Target = DynProvider<Ethereum>;

    fn deref(&self) -> &Self::Target {
        &self.0
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_client() -> anyhow::Result<()> {
        Client::new("http://localhost:8545")?;
        Ok(())
    }
}
