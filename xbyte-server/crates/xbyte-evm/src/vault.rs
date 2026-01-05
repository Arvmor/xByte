use alloy_primitives::Address;
use alloy_provider::Provider;
use alloy_sol_types::sol;
use std::ops::Deref;

sol! {
    #[sol(rpc)]
    "contracts/xByteVault.sol"
}

sol! {
    #[sol(rpc)]
    "contracts/xByteRelay.sol"
}

/// Relay Interface for [`xByteRelay`] contract.
#[derive(Debug, Clone)]
pub struct Relay<P>(xByteRelay::xByteRelayInstance<P>);

impl<P: Provider> Relay<P> {
    /// Initialize an Instance of the Relay
    pub fn new(address: Address, provider: P) -> Self {
        let instance = xByteRelay::xByteRelayInstance::new(address, provider);
        Self(instance)
    }
}

impl<P> Deref for Relay<P> {
    type Target = xByteRelay::xByteRelayInstance<P>;

    fn deref(&self) -> &Self::Target {
        &self.0
    }
}

/// Vault Interface for [`xByteVault`] contract.
#[derive(Debug, Clone)]
pub struct Vault<P>(xByteVault::xByteVaultInstance<P>);

impl<P: Provider> Vault<P> {
    /// Initialize an Instance of the Vault
    pub fn new(address: Address, provider: P) -> Self {
        let instance = xByteVault::xByteVaultInstance::new(address, provider);
        Self(instance)
    }
}

impl<P> Deref for Vault<P> {
    type Target = xByteVault::xByteVaultInstance<P>;

    fn deref(&self) -> &Self::Target {
        &self.0
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::Client;

    #[test]
    fn test_relay() -> anyhow::Result<()> {
        let provider = Client::new("http://localhost:8545")?;
        Relay::new(Default::default(), provider);
        Ok(())
    }

    #[test]
    fn test_vault() -> anyhow::Result<()> {
        let provider = Client::new("http://localhost:8545")?;
        Vault::new(Default::default(), provider);
        Ok(())
    }
}
