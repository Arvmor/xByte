# xByte SDK

TypeScript SDK for integrating with [xByte](https://github.com/Arvmor/xbyte) - the pay-per-byte infrastructure protocol that enables content monetization through x402 payments.

## Installation

```bash
npm install xbyte-sdk
# or
pnpm add xbyte-sdk
# or
yarn add xbyte-sdk
```

## Quick Start

```typescript
import { xByteClient } from "xbyte-sdk";

// Create the xByte client
const client = new xByteClient("https://api.xbyte.com/API_KEY");

// Use this client to integrate xByte infra.
// Upload content, set price, get price, pay for content, etc.
await client.setPrice({
  key: "550e8400-e29b-41d4-a716-446655440000",
  // USDC per 1MB
  price: 0.001,
});
...
```

## API Methods

- ### `uploadContent(content)`

Uploads content (audio, video, etc.) to the xByte server.

```typescript
// { status: "Success", data: "550e8400-e29b-41d4-a716-446655440000" }
const { status, data } = await client.uploadContent(file);
```

**Returns:** `ApiResponse<UUID, string>` - The UUID key for the uploaded content.

- ### `setPrice(price)`

Sets the per-byte price for content.

```typescript
await client.setPrice({
    key: "550e8400-e29b-41d4-a716-446655440000",
    // USDC per byte
    price: 0.001,
});
```

- ### `getPrice(key)`

Retrieves the price for a specific content.

```typescript
// { status: "Success", data: "0.001" }
const { status, data } = await client.getPrice("550e8400-e29b-41d4-a716-446655440000");
```

- ### `play(body, payment)`

Requests a byte range of content with x402 payment authorization.

```typescript
const response = await client.play(
    {
        key: "550e8400-e29b-41d4-a716-446655440000",
        offset: 0,
        length: 1024 * 1024, // 1MB
    },
    {
        x402Version: 1,
        scheme: "exact",
        network: "base-sepolia",
        payload: {
            signature: "0x...",
            authorization: {
                from: "0x...",
                to: "0x...",
                value: "1000",
                validAfter: "0",
                validBefore: "1893456000",
                nonce: "0x...",
            },
        },
    },
);
// { status: "Success", data: [/* byte array */] }
```

- ### `health()`

Returns the health status of the xByte server.

```typescript
// { status: "Success", data: "OK" }
const { status, data } = await client.health();
```

- ### `version()`

Returns the API version.

```typescript
// { status: "Success", data: "1.0.0" }
const { status, data } = await client.version();
```

## Types

### `ApiResponse<T, E>`

```typescript
interface ApiResponse<T, E> {
    status: "Success" | "Error" | "PaymentRequired";
    data: T | E;
}
```

### `PlayRequest`

```typescript
interface PlayRequest {
    key: UUID;
    offset: number;
    length: number;
}
```

### `SetPriceRequest`

```typescript
interface SetPriceRequest {
    key: UUID;
    price: number;
}
```

### `X402PaymentPayload`

```typescript
interface X402PaymentPayload {
    x402Version: number;
    scheme: string;
    network: string;
    payload: {
        signature: string;
        authorization: {
            from: string;
            to: string;
            value: string;
            validAfter: string;
            validBefore: string;
            nonce: string;
        };
    };
}
```

## License

MIT
