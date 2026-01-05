# xbyte-evm

A Rust library for interacting with xByte smart contracts on EVM-compatible chains. This crate provides type-safe bindings and utilities for the xByte Factory, Vault, and Relay contracts.

## Features

- **Type-safe contract bindings** - Auto-generated bindings from Solidity contracts using Alloy
- **Factory operations** - Create and manage xByte vaults through the factory contract
- **Vault interactions** - Direct interaction with deployed vault instances
- **Relay support** - Interface with the beacon proxy relay contract
- **CREATE2 address computation** - Deterministic vault address calculation
- **Provider abstraction** - Works with any Alloy-compatible provider

## Installation

Add this to your `Cargo.toml`:

```toml
[dependencies]
xbyte-evm = "0.1.0"
```

## Quick Start

### Basic Usage

```rust
use xbyte_evm::{Client, Factory, Vault};
use alloy_primitives::Address;

// Initialize a client
let client = Client::new("https://sepolia.base.org")?;

// Get a factory instance
let factory = client.clone().get_factory();

// Compute a vault address for an owner
let owner = address!("d6404c4d93e9ea3cdc247d909062bdb6eb0726b0");
let vault_address = Factory::<()>::compute_vault(owner);

// Interact with a vault
let vault = Vault::new(vault_address, client);
```

### Creating a Vault

```rust
use xbyte_evm::{Client, Factory};

let client = Client::new("https://sepolia.base.org")?;
let factory = client.clone().get_factory();

// Create a new vault (requires transaction signing)
let tx = factory.createVault().send().await?;
let receipt = tx.get_receipt().await?;
```

### Computing Vault Address

```rust
use xbyte_evm::Factory;
use alloy_primitives::Address;

let owner = address!("d6404c4d93e9ea3cdc247d909062bdb6eb0726b0");
let vault_address = Factory::<()>::compute_vault(owner);
```

## API Reference

### `Client`

The main client for connecting to EVM networks.

```rust
pub struct Client(DynProvider<Ethereum>);

impl Client {
    pub fn new(url: &str) -> anyhow::Result<Self>;
    pub fn get_factory(self) -> Factory<Self>;
    pub fn get_relay(self, address: Address) -> Relay<Self>;
}
```

### `Factory`

Interface for the xByteFactory contract.

```rust
pub struct Factory<P>(xByteFactory::xByteFactoryInstance<P>);

impl<P: Provider> Factory<P> {
    pub fn new(provider: P) -> Self;
}

impl<P> Factory<P> {
    pub const ADDRESS: Address;
    pub const RELAY_ADDRESS: Address;
    pub fn compute_vault(owner: Address) -> Address;
}
```

The `Factory` implements `Deref` to `xByteFactory::xByteFactoryInstance<P>`, giving you access to all contract methods.

### `Vault`

Interface for the xByteVault contract.

```rust
pub struct Vault<P>(xByteVault::xByteVaultInstance<P>);

impl<P: Provider> Vault<P> {
    pub fn new(address: Address, provider: P) -> Self;
}
```

The `Vault` implements `Deref` to `xByteVault::xByteVaultInstance<P>`, giving you access to all contract methods.

### `Relay`

Interface for the xByteRelay contract.

```rust
pub struct Relay<P>(xByteRelay::xByteRelayInstance<P>);

impl<P: Provider> Relay<P> {
    pub fn new(address: Address, provider: P) -> Self;
}
```

The `Relay` implements `Deref` to `xByteRelay::xByteRelayInstance<P>`, giving you access to all contract methods.

## Architecture

This crate provides Rust bindings for three main contracts:

- **xByteFactory** - Factory contract that deploys deterministic vault proxies using CREATE2
- **xByteVault** - User vault contract for managing assets
- **xByteRelay** - Beacon proxy relay contract for upgradeable vaults

The bindings are generated from Solidity contracts using Alloy's `sol!` macro, providing type-safe, zero-cost abstractions over the contract ABIs.

## Contract Addresses

The factory contract address is hardcoded as a constant:

```rust
Factory::ADDRESS  // 0x4957cDc66a60FfBf6E78baE23d18973a5dcC3e05
Factory::RELAY_ADDRESS  // 0xe6d1316B8BBe88B0dc0A67ae754d1A5ce296C1Da
```

## Examples

### Async Vault Creation

```rust
use xbyte_evm::{Client, Factory};
use alloy_primitives::Address;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    let client = Client::new("https://sepolia.base.org")?;
    let factory = client.clone().get_factory();
    
    // Compute vault address before creation
    let owner = address!("d6404c4d93e9ea3cdc247d909062bdb6eb0726b0");
    let computed = Factory::<()>::compute_vault(owner);
    
    // Verify with on-chain computation
    let on_chain = factory.computeVaultAddress(owner).call().await?;
    assert_eq!(computed, on_chain);
    
    Ok(())
}
```

### Using Custom Providers

Since the types are generic over `Provider`, you can use any Alloy-compatible provider:

```rust
use xbyte_evm::Factory;
use alloy_provider::Provider;

fn use_custom_provider<P: Provider>(provider: P) -> Factory<P> {
    Factory::new(provider)
}
```

## Development

### Running Tests

```bash
cargo test
```

### Building

```bash
cargo build --release
```

### Contract Bindings

The contract bindings are automatically generated from Solidity files in the `contracts/` directory using Alloy's `sol!` macro. To update bindings, modify the Solidity contracts and rebuild.

## Dependencies

- `alloy-sol-types` - Solidity type system
- `alloy-contract` - Contract interaction utilities
- `alloy-provider` - EVM provider abstraction
- `alloy-primitives` - EVM primitive types
- `anyhow` - Error handling

## License

See the workspace root for license information.

