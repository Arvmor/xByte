# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

xByte is a pay-per-byte content monetization protocol built on the x402 payment standard. It enables platforms (Netflix, Spotify, Twitch) to monetize content on a granular, per-byte basis rather than subscriptions. Users pay only for what they consume (e.g., 0.001 USDC per 1MB of video).

**Architecture:** Three-component monorepo:
- **xbyte-server** - Rust backend (Actix web framework)
- **xbyte-web** - TypeScript frontend (Next.js monorepo)
- **xbyte-contracts** - Solidity smart contracts (Foundry)

## Development Commands

### Rust Backend (xbyte-server)

```bash
cd xbyte-server

# Run server (localhost:80, configurable via SERVER_ADDR env)
cargo run --release

# Run in debug mode
cargo run

# Run tests
cargo test --workspace --all-features

# Linting
cargo clippy --workspace --all-targets --all-features

# Format check
cargo fmt --all --check

# Format code
cargo fmt --all
```

**Required Environment Variables:**
- `RPC_URL` - Base Sepolia RPC endpoint
- `SERVER_ADDR` - Server address (e.g., "0.0.0.0:80")
- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION` - AWS credentials for S3

### TypeScript Frontend (xbyte-web)

```bash
cd xbyte-web

# Install dependencies (uses Bun 1.3.4+)
bun install

# Build all workspaces
bun run build

# Build specific workspace
cd xbyte-sdk && bun build
cd xbyte-platform && bun build

# Lint all workspaces
bun run lint

# Lint with auto-fix
bun run lint:fix

# Format all workspaces
bun run format

# Format check
bun run format:check

# Run development server (xbyte-platform, localhost:3000)
cd xbyte-platform && bun dev

# Run demo (spotify-demo, localhost:3000)
cd spotify-demo && bun dev
```

**Workspace Structure:**
- `xbyte-sdk` - Core SDK library (REST + EVM clients)
- `xbyte-components` - Shared React UI components
- `xbyte-platform` - Admin dashboard
- `spotify-demo` - Reference implementation
- `xbyte-docs` - Docusaurus documentation site

**Frontend Environment Variables:**
- `NEXT_PUBLIC_XBYTE_URL` - Backend API URL
- `NEXT_PUBLIC_RPC_URL` - Base Sepolia RPC endpoint
- `NEXT_PUBLIC_CHAIN_ID` - Chain ID (84532 for Base Sepolia)
- `NEXT_PUBLIC_USDC_ADDRESS` - USDC token address

### Smart Contracts (xbyte-contracts)

```bash
cd xbyte-contracts

# Run tests
forge test -vvv

# Build contracts
forge build --sizes

# Format check
forge fmt --check

# Format code
forge fmt

# Deploy scripts
forge script script/Deploy.s.sol --rpc-url $RPC_URL --broadcast
```

**Deployed Contracts (Base Sepolia):**
- Factory: `0x4957cDc66a60FfBf6E78baE23d18973a5dcC3e05`
- Relay: `0xe6d1316B8BBe88B0dc0A67ae754d1A5ce296C1Da`

## Architecture Overview

### Backend (Rust) - xbyte-server

**Workspace Crates:**

1. **xbyte-app** (binary) - Entry point, server bootstrapping
2. **xbyte-api** (library) - HTTP server, business logic, routes
3. **xbyte-evm** (library) - Smart contract interactions via Alloy RS

**Key Modules in xbyte-api:**

- **server.rs** - Actix server setup and route registration
- **x402.rs** - x402 payment protocol implementation and verification
- **client/** - Platform/client management and schemas
- **pricing/** - Dynamic per-object pricing
- **s3/** - AWS S3 integration with IAM role assumption for range-based file serving
- **db.rs** - In-memory database with `Arc<RwLock<HashMap>>` (trait-based for future persistence)
- **utils.rs** - API response wrappers, price calculations

**Important Patterns:**

1. **HttpServiceFactory Enum Pattern** - Type-safe route registration:
   ```rust
   enum ClientRoute { CreateClient, GetClient }
   impl HttpServiceFactory for ClientRoute { ... }
   ```

2. **Database Trait** - Allows swapping storage backends (PostgreSQL, DynamoDB):
   ```rust
   trait Database { type KeyPrice; type Price; ... }
   ```

3. **IAM Role Assumption** - Multi-tenant S3 access without credential storage:
   ```rust
   XByteS3::new_assumed_role(&sts_client, role_arn, session_name, region)
   ```

4. **x402 Protocol Flow**:
   - Client requests resource → Server calculates price → Returns 402 Payment Required
   - Client submits X-Payment header → Server verifies via x402.org facilitator → Async settlement
   - Server returns S3 byte range data

### Frontend (TypeScript) - xbyte-web

**xbyte-sdk Core Classes:**

- `xByteClient` - REST API client for backend operations (health, pricing, clients, S3)
- `xByteEvmClient` - EVM contract read operations (vault computation, balances, events)

**xbyte-components Structure:**

- `ui/` - Radix UI primitives (Button, Card, Input, Dialog, etc.)
- `app/` - App layout components (Header, Footer, Logo, Page, Theme)
- `platform/` - Business components (SectionHeader, FeatureCard, Charts, ProgressStepper, FAQ)
- `privy/` - Wallet integration (PrivyConnect, PrivyPay, PrivyProfile, PrivyProvider)
- `track/` - Media player components (TrackItem, TrackPlayer)

### Smart Contracts (Solidity) - xbyte-contracts

**Contract Architecture:**

1. **xByteFactory.sol** - Deploys deterministic user vaults via BeaconProxy (CREATE2)
   - `createVault()` - Deploy vault for caller
   - `computeVaultAddress(owner)` - Deterministic address calculation
   - `withdraw()` - Owner withdraws fees

2. **xByteVault.sol** - Individual payment vault per user
   - `initialize(owner, factory)` - Set ownership
   - `withdraw()` - User withdraws with 1% commission to factory
   - Pattern: OwnableUpgradeable + ReentrancyGuard

3. **xByteRelay.sol** - Beacon for vault implementation upgrades (UpgradeableBeacon)

**Key Design: CREATE2 Deterministic Vaults**
- Vault addresses computed offline using `bytes32(owner_address)` as salt
- Same address across all tools/interfaces without deployment
- Enables pre-computation in backend and SDK

## x402 Payment Protocol Implementation

**Payment Flow:**

1. Client requests content with offset/length query params
2. Server looks up price per MB from database
3. Server calculates: `price = (price_per_mb_wei) × (byte_length / 1_048_576)`
4. If no X-Payment header → Return 402 with payment request
5. If X-Payment present → Parse and verify via POST to `https://www.x402.org/facilitator/verify`
6. On success → Spawn async settlement task + return S3 bytes
7. Async: POST to `/facilitator/settle` for on-chain transaction

**Payment Data Structures:**

```rust
X402Response {
    x402_version: 1,
    accepts: [PaymentRequest {
        scheme: "exact",
        network: "base-sepolia",
        max_amount_required: calculated_price,
        pay_to: platform_vault_address,
        asset: USDC_token_address,
        ...
    }]
}

PaymentExtractor {
    x402_version: 1,
    scheme: "exact",
    network: "base-sepolia",
    payload: {
        signature: string,
        authorization: { from, to, value, valid_after, valid_before, nonce }
    }
}
```

## Component Interactions

```
Frontend (xbyte-sdk)
  ↓ HTTP REST API
Backend (xbyte-api)
  ↓ Read-only RPC calls ↓ S3 API ↓ x402 Facilitator API
Base Sepolia RPC | AWS S3 | x402.org/facilitator
```

**Key Integration Points:**

1. **SDK → Backend** - REST API for pricing, client management, S3 operations
2. **Backend → Blockchain** - Read-only contract calls for vault address computation
3. **Backend → S3** - IAM role assumption for multi-tenant byte-range downloads
4. **Backend → x402 Facilitator** - Payment verification and settlement delegation
5. **Frontend → Contracts** - Direct EVM reads for balance checks, event queries

## Important Conventions

1. **Monorepo Workspaces** - Both Rust and TypeScript use workspace dependencies:
   ```toml
   [workspace.dependencies]
   xbyte_api = { path = "crates/xbyte-api" }
   ```
   ```json
   { "dependencies": { "xbyte-sdk": "workspace:*" } }
   ```

2. **Formatting/Linting** - Use oxlint/oxfmt for TypeScript (configured in `.oxfmtrc.jsonc`)

3. **Environment Files** - `.env` at root (backend), workspace packages use NEXT_PUBLIC_ prefix

4. **Contract Bindings** - Rust uses `sol!` macro from Alloy for type-safe contract interfaces:
   ```rust
   sol! { #[sol(rpc)] "contracts/xByteFactory.sol" }
   ```

5. **Async Payment Settlement** - Payment verification is synchronous, settlement is async (spawned task)

6. **Error Handling** - Backend uses `ResultAPI<D, E>` enum with `Success`, `Error`, `PaymentRequired` variants

7. **Database Pattern** - Current: In-memory with trait abstraction for future persistence layer

## Git Workflows

**Branches:**
- `master` - Main branch (use for PRs)
- `development` - Current working branch

**CI Pipelines:**
- `ci-xbyte-server.yml` - Rust clippy, fmt, test
- `ci-xbyte-client.yml` - TypeScript format (oxfmt), lint (oxlint), build
- `ci-xbyte-contracts.yml` - Forge fmt, test, build

All CI runs on push/PR to `master` branch with path filters.

## Testing Notes

- **Rust**: Use `cargo test --workspace --all-features`
- **Solidity**: Use `forge test -vvv` for verbose output
- **TypeScript**: No explicit test scripts in package.json (build serves as validation)

## Key Files to Reference

- `xbyte-server/Cargo.toml` - Workspace dependencies and shared config
- `xbyte-web/package.json` - Workspace root scripts
- `xbyte-contracts/foundry.toml` - Solidity compiler settings and remappings
- `README.md` - Project overview and quickstart
- `.env.example` - Required environment variables template
