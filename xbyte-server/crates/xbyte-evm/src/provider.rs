use crate::{Factory, Relay};
use alloy_primitives::Address;
use alloy_provider::network::Ethereum;
use alloy_provider::{DynProvider, Provider};
use std::ops::Deref;

/// xByte EVM Client
#[derive(Debug, Clone)]
pub struct Client(DynProvider<Ethereum>);

impl Client {
    /// Initialize a new EVM Client
    pub fn new(url: &str) -> anyhow::Result<Self> {
        let url = url.parse()?;
        let provider = DynProvider::builder().connect_http(url).erased();
        Ok(Self(provider))
    }

    /// Get a new Factory instance
    pub fn get_factory(self) -> Factory<Self> {
        Factory::new(self)
    }

    /// Get a new Relay instance
    pub fn get_relay(self, address: Address) -> Relay<Self> {
        Relay::new(address, self)
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
