---
sidebar_position: 2
---

# Getting Started

This guide will help you get started with the xByte SDK. You'll learn how to install the SDK, create clients, and make your first API calls.

## Installation

Install the xByte SDK using your preferred package manager:

```bash
npm install xbyte-sdk
```

```bash
pnpm add xbyte-sdk
```

```bash
yarn add xbyte-sdk
```

## Prerequisites

- Node.js 18+ or Bun
- TypeScript (recommended)
- An xByte API endpoint URL (or use the default)

## Basic Setup

### Import the SDK

```typescript
import { xByteClient, xByteEvmClient } from "xbyte-sdk";
```

### Create an API Client

The `xByteClient` is used to interact with the xByte API server:

```typescript
const client = new xByteClient();
```

If no URL is provided, it defaults to `https://api.xbyte.sh`:

```typescript
const client = new xByteClient();
```

### Create an EVM Client

The `xByteEvmClient` is used to interact with xByte smart contracts:

```typescript
const evmClient = new xByteEvmClient("https://sepolia.base.org");
```

If no RPC URL is provided, it defaults to `https://sepolia.base.org`.

## Your First API Call

Let's start with a simple health check:

```typescript
import { xByteClient } from "xbyte-sdk";

const client = new xByteClient();

const response = await client.health();

if (response.status === "Success") {
    console.log("Server is healthy:", response.data);
} else {
    console.error("Error:", response.data);
}
```

## Working with Clients

### Creating a Client

Before you can upload content or set prices, you need to create a client:

```typescript
const clientResponse = await client.createClient({
    name: "My Content Platform",
    wallet: "0x1234567890123456789012345678901234567890",
});

if (clientResponse.status === "Success") {
    console.log("Client created:", clientResponse.data);
    const clientId = clientResponse.data.id;
}
```

### Registering Storage

After creating a client, register your S3 storage to allow xByte to access your content:

```typescript
const storageResponse = await client.registerStorage({
    storage: {
        s3: {
            roleArn: "arn:aws:iam::123456789012:role/xbyte-access",
            region: "us-east-1",
        },
    },
    client: clientId,
});

if (storageResponse.status === "Success") {
    console.log("Storage registered:", storageResponse.data);
}
```

## Setting Content Prices

Once you have a bucket, you can set prices for your content:

```typescript
const priceResponse = await client.setPrice({
    bucket: "my-content-bucket",
    object: "my-video.mp4",
    price: 0.001, // Price per byte in USDC
});

if (priceResponse.status === "Success") {
    console.log("Price set successfully");
}
```

## Retrieving Prices

Get the price for a specific content object:

```typescript
const priceResponse = await client.getPrice("my-content-bucket", "my-video.mp4");

if (priceResponse.status === "Success") {
    console.log("Price:", priceResponse.data);
}
```

## Error Handling

All API methods return an `ApiResponse<T, E>` type. Always check the `status` field:

```typescript
const response = await client.getPrice("bucket", "object");

if (response.status === "Success") {
    const price = response.data;
} else if (response.status === "Error") {
    console.error("API Error:", response.data);
} else if (response.status === "PaymentRequired") {
    console.log("Payment required:", response.data);
}
```

## Next Steps

- Learn about all [API Client methods](./api-client)
- Explore [EVM Client features](./evm-client) for blockchain interactions
- Check out [practical examples](./examples)
- Review the [types reference](./types)
