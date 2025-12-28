use alloy_primitives::{Address, B256, address, b256};
use alloy_provider::Provider;
use alloy_sol_types::sol;
use std::ops::Deref;

sol! {
    #[sol(rpc)]
    "../../../xbyte-contracts/src/xByteFactory.sol"
}

/// Factory Interface for [`xByteFactory`] contract.
#[derive(Debug, Clone)]
pub struct Factory<P>(xByteFactory::xByteFactoryInstance<P>);

impl<P: Provider> Factory<P> {
    /// Initialize an Instance of the Factory
    pub fn new(provider: P) -> Self {
        let instance = xByteFactory::xByteFactoryInstance::new(Self::ADDRESS, provider);
        Self(instance)
    }
}

impl<P> Factory<P> {
    /// The address of the xByteFactory contract
    pub const ADDRESS: Address = address!("b0b6c2EC918388aE785541a0635E36c69358A80d");
    /// Compute the vault address for the owner
    pub fn compute_vault(owner: Address) -> Address {
        let salt = B256::right_padding_from(owner.as_slice());
        Self::ADDRESS.create2(salt, Vault::BYTECODE_HASH)
    }
}

impl<P> Deref for Factory<P> {
    type Target = xByteFactory::xByteFactoryInstance<P>;

    fn deref(&self) -> &Self::Target {
        &self.0
    }
}

impl Vault {
    /// Vault Contract Bytecode Hash
    pub const BYTECODE_HASH: B256 =
        b256!("b96a047c19a46c6f3264aa16982972b638fc5019616632f4faf176f9cbce2a88");
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::Client;

    #[test]
    fn test_factory() -> anyhow::Result<()> {
        let provider = Client::new("http://localhost:8545")?;
        Factory::new(provider);

        Ok(())
    }

    #[test]
    fn test_compute_vault_sync() -> anyhow::Result<()> {
        // Compute the vault address for the owner
        let owner = address!("d6404c4d93e9ea3cdc247d909062bdb6eb0726b0");
        let address = Factory::<()>::compute_vault(owner);

        // Verify CREATE2
        let expected = address!("69b645ee2dae3ce10483118bc52bdc5e6e574d26");
        assert_eq!(address, expected);
        Ok(())
    }

    #[tokio::test]
    async fn test_all_compute_vault_address() -> anyhow::Result<()> {
        let provider = Client::new("https://sepolia.base.org")?;
        let factory = Factory::new(provider);

        let owner = address!("d6404c4d93e9ea3cdc247d909062bdb6eb0726b0");
        let address_sync = Factory::<()>::compute_vault(owner);
        let address_async = factory.computeVaultAddress(owner).call().await?;
        let expected = address!("69b645ee2dae3ce10483118bc52bdc5e6e574d26");

        assert_eq!(address_sync, address_async);
        assert_eq!(address_sync, expected);
        assert_eq!(address_async, expected);
        Ok(())
    }
}
