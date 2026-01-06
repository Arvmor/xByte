# [xByte](https://xbyte.sh) &emsp; [![xByte Server]][Action Server] [![xByte Client]][Action Client] [![xByte Contracts]][Action Contracts] [![Latest Version]][crates.io] [![npm version]][Version NPM]

[xByte Server]: https://github.com/Arvmor/xByte/actions/workflows/ci-xbyte-server.yml/badge.svg
[Action Server]: https://github.com/Arvmor/xByte/actions/workflows/ci-xbyte-server.yml
[xByte Contracts]: https://github.com/Arvmor/xByte/actions/workflows/ci-xbyte-contracts.yml/badge.svg
[Action Contracts]: https://github.com/Arvmor/xByte/actions/workflows/ci-xbyte-contracts.yml
[xByte Client]: https://github.com/Arvmor/xByte/actions/workflows/ci-xbyte-client.yml/badge.svg
[Action Client]: https://github.com/Arvmor/xByte/actions/workflows/ci-xbyte-client.yml
[Latest Version]: https://img.shields.io/crates/v/xbyte-evm.svg
[crates.io]: https://crates.io/crates/xbyte-evm
[npm version]: https://img.shields.io/npm/v/xbyte-sdk.svg?style=flat
[Version NPM]: https://www.npmjs.com/package/xbyte-sdk

[Website](https://xbyte.sh) | [Demo](https://demo.xbyte.sh) | [Documentation](https://docs.xbyte.sh) | [API](https://api.xbyte.sh)

xByte, the infra-as-a-service protocol.

## Introduction

Facilitates "Pay-per-Byte" x402 payments, allows content-agnostic monetization model for platforms (Netflix, Spotify, Twitch, etc.), instead of monthly subscriptions! [more information](./docs/xByte_slides.pdf)

e.g.: Pay 0.001 USDC per 1MB of a movie.

### 🏆 2nd Place - AVAX x402 Hackathon

![xByte Demo](./docs/demo.gif)

### How to Run

Requires Node and Rust to be installed.

```bash
$ git clone https://github.com/Arvmor/xbyte.git
$ cd xbyte

# For server (runs at localhost:80)
$ cd xbyte-server
$ cargo run --release

# For SDK (builds the SDK package)
$ cd xbyte-web/xbyte-sdk
$ bun i
$ bun build

# For Demo website (runs at localhost:3000)
$ cd xbyte-web/spotify-demo
$ bun i
$ bun dev
```

## Description

xByte is the pay-per-byte infra that enables monetization through x402 for any content that can be converted to bytes. (video, music, live streams, etc.)

The xByte TypeScript SDK lets platforms integrate directly with the xByte infrastructure, set per-byte pricing, control access to their content, and seamlessly receive payments. Think Netflix movies, Spotify songs, Twitch streams, ..., all metered by the byte!

### For Platforms

- Entertainment platforms can reach users who prefer to pay only for what they consume, eliminating the incentive to share/borrow accounts for lower prices to game the system.
- Drop-in infrastructure, not a competing app. xByte is rails, not a destination. Platforms own their UX; we provide metered billing as a service.

### For Users

- Users pay only for what they watch or listen to, whether it's their favorite show or songs during Saturday evening workouts at the gym.
- Web2 friendly, Fund your account with a card or PayPal. Under the hood it's USDC and x402, but users never need to know it's crypto.

### For Creators & Rights Holders

- Artists receive transparent, on-chain royalties and can set dynamic pricing. If a moment in their content goes viral, they earn more as viewers rewind and rewatch that specific segment, paying for every second.

### For AI Agents

- AI agents can access content across platforms and pay royalties directly to artists, filmmakers, and streamers.

## Tech Stack

- Backend (Rust, Actix)
- SDK (TypeScript)
- Frontend (NextJS, Privy)
- File Storage (DB / S3, TBD)
- x402

## Architecture

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend

    User->>Frontend: Request to play song (0:00-0:05)
    Frontend->>Backend: Request segment (0:00-0:05)
    Backend-->>Frontend: 402 Payment Required (x402)
    Frontend->>User: Prompt for payment
    User->>Frontend: Authorize payment
    Frontend->>Backend: Pay x402
    Backend-->>Frontend: Audio bytes (0:00-0:05)
    Frontend->>User: Play audio segment

    Note over User,Backend: Pattern continues for subsequent segments...
```
