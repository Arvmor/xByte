use alloy_primitives::Address;
use serde::{Deserialize, Serialize};
use xbyte_evm::Factory;

/// xByte Client
#[derive(Debug, Serialize, Deserialize, Clone, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct Client<N = String>
where
    N: AsRef<str>,
{
    /// Unique ID
    pub id: Option<Address>,
    /// Nickname
    pub name: N,
    /// Wallet Address
    pub wallet: Address,
    /// Vault Address
    pub vault: Option<Address>,
}

impl<N: AsRef<str>> Client<N> {
    /// Create a new client
    pub fn new(name: N, wallet: Address) -> Self {
        let vault = Some(Factory::<()>::compute_vault(wallet));

        Self {
            id: Some(wallet),
            name,
            wallet,
            vault,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use alloy_primitives::address;

    #[test]
    fn test_create_client() -> anyhow::Result<()> {
        let name = "test";
        let wallet = address!("0x1234567890123456789012345678901234567890");
        let client = Client::new(name, wallet);

        assert_eq!(client.name, name);
        assert_eq!(client.wallet, wallet);
        assert!(client.vault.is_some());
        Ok(())
    }
}
