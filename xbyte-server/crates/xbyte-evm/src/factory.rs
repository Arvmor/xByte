use alloy_primitives::{Address, B256, Bytes, address, bytes};
use alloy_provider::Provider;
use alloy_sol_types::{SolCall, SolValue, sol};
use std::ops::Deref;

sol! {
    #[sol(rpc)]
    "contracts/xByteFactory.sol"
}

sol! {
    #[sol(rpc)]
    "contracts/xByteVault.sol"
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
    pub const ADDRESS: Address = address!("4957cDc66a60FfBf6E78baE23d18973a5dcC3e05");
    /// The address of the xByteRelay contract
    pub const RELAY_ADDRESS: Address = address!("e6d1316B8BBe88B0dc0A67ae754d1A5ce296C1Da");
    /// The Beacon Proxy Bytecode
    pub const BEACON_PROXY_BYTECODE: Bytes = bytes!(
        "60a060405260405161054538038061054583398101604081905261002291610331565b61002c828261003e565b506001600160a01b0316608052610413565b610047826100fb565b6040516001600160a01b038316907f1cf3b03a6cf19fa2baba4df148e9dcabedea7f8a5c07840e207e5c089be95d3e905f90a28051156100ef576100ea826001600160a01b0316635c60da1b6040518163ffffffff1660e01b8152600401602060405180830381865afa1580156100c0573d5f5f3e3d5ffd5b505050506040513d601f19601f820116820180604052508101906100e491906103f3565b82610209565b505050565b6100f76102aa565b5050565b806001600160a01b03163b5f0361013557604051631933b43b60e21b81526001600160a01b03821660048201526024015b60405180910390fd5b807fa3f0ad74e5423aebfd80d3ef4346578335a9a72aeaee59ff6cb3582b35133d5080546001600160a01b0319166001600160a01b0392831617905560408051635c60da1b60e01b815290515f92841691635c60da1b9160048083019260209291908290030181865afa1580156101ae573d5f5f3e3d5ffd5b505050506040513d601f19601f820116820180604052508101906101d291906103f3565b9050806001600160a01b03163b5f036100f757604051634c9c8ce360e01b81526001600160a01b038216600482015260240161012c565b60605f61021684846102cb565b905080801561023757505f3d118061023757505f846001600160a01b03163b115b1561024c576102446102de565b9150506102a4565b801561027657604051639996b31560e01b81526001600160a01b038516600482015260240161012c565b3d15610289576102846102f7565b6102a2565b60405163d6bda27560e01b815260040160405180910390fd5b505b92915050565b34156102c95760405163b398979f60e01b815260040160405180910390fd5b565b5f5f5f835160208501865af49392505050565b6040513d81523d5f602083013e3d602001810160405290565b6040513d5f823e3d81fd5b80516001600160a01b0381168114610318575f5ffd5b919050565b634e487b7160e01b5f52604160045260245ffd5b5f5f60408385031215610342575f5ffd5b61034b83610302565b60208401519092506001600160401b03811115610366575f5ffd5b8301601f81018513610376575f5ffd5b80516001600160401b0381111561038f5761038f61031d565b604051601f8201601f19908116603f011681016001600160401b03811182821017156103bd576103bd61031d565b6040528181528282016020018710156103d4575f5ffd5b8160208401602083015e5f602083830101528093505050509250929050565b5f60208284031215610403575f5ffd5b61040c82610302565b9392505050565b60805161011b61042a5f395f601d015261011b5ff3fe6080604052600a600c565b005b60186014601a565b609d565b565b5f7f00000000000000000000000000000000000000000000000000000000000000006001600160a01b0316635c60da1b6040518163ffffffff1660e01b8152600401602060405180830381865afa1580156076573d5f5f3e3d5ffd5b505050506040513d601f19601f820116820180604052508101906098919060ba565b905090565b365f5f375f5f365f845af43d5f5f3e80801560b6573d5ff35b3d5ffd5b5f6020828403121560c9575f5ffd5b81516001600160a01b038116811460de575f5ffd5b939250505056fea26469706673582212200e9f6ac2a8d44f45d8d05639f1a8be958d3bc082195e1824ac4489ef8d79ef3664736f6c634300081f0033"
    );
    /// Compute the vault address for the owner
    pub fn compute_vault(owner: Address) -> Address {
        let salt = B256::right_padding_from(owner.as_slice());
        let init_code = xByteVault::initializeCall::new((owner, Self::ADDRESS)).abi_encode();
        let proxy_code = (
            Self::BEACON_PROXY_BYTECODE,
            (Self::RELAY_ADDRESS, &init_code).abi_encode_params(),
        );
        let codehash = alloy_primitives::keccak256(proxy_code.abi_encode_packed());
        Self::ADDRESS.create2(salt, codehash)
    }
}

impl<P> Deref for Factory<P> {
    type Target = xByteFactory::xByteFactoryInstance<P>;

    fn deref(&self) -> &Self::Target {
        &self.0
    }
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
        let expected = address!("1adac06802a7f7d3a20e68fd9b51b010fa172bd5");
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

        assert_eq!(address_sync, address_async);
        Ok(())
    }
}
