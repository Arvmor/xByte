use alloy_primitives::Address;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

/// xByte Client
#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Client<N = String>
where
    N: AsRef<str>,
{
    /// Unique ID
    pub id: Option<Uuid>,
    /// Nickname
    pub name: N,
    /// Wallet Address
    pub wallet: Address,
}

impl<N: AsRef<str>> Client<N> {
    /// Create a new client
    pub fn new(name: N, wallet: Address) -> Self {
        let id = Some(Uuid::new_v4());
        Self { id, name, wallet }
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
        Ok(())
    }
}
