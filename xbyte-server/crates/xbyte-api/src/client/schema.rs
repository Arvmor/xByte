use alloy_primitives::Address;
use serde::{Deserialize, Serialize};
use xbyte_evm::Factory;

/// xByte Client
#[derive(Debug, Serialize, Deserialize, Clone, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct Client<N = String> {
    /// Unique ID
    pub id: Option<Address>,
    /// Nickname
    pub name: N,
    /// Wallet Address
    pub wallet: Address,
    /// Vault Address
    pub vault: Option<Address>,
    /// Data Storage Information
    pub storage: Option<Storage<N>>,
}

impl<N> Client<N> {
    /// Create a new client
    pub fn new(name: N, wallet: Address) -> Self {
        let vault = Some(Factory::<()>::compute_vault(wallet));
        let storage = None;

        Self {
            id: Some(wallet),
            name,
            wallet,
            vault,
            storage,
        }
    }
}

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub enum Storage<S> {
    /// AWS S3
    S3 {
        /// ARN of the role to assume
        role_arn: S,
        /// Region of the AWS account
        region: S,
    },
}

impl<S> Storage<S> {
    /// Get the role ARN
    pub fn role_arn(&self) -> &S {
        match self {
            Self::S3 { role_arn, .. } => role_arn,
        }
    }

    /// Get the region
    pub fn region(&self) -> &S {
        match self {
            Self::S3 { region, .. } => region,
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
