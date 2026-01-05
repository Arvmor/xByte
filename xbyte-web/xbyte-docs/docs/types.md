---
sidebar_position: 5
---

# Types Reference

This page documents all TypeScript types and interfaces available in the xByte SDK.

## Core Types

### `ApiResponse<T, E>`

A discriminated union type representing API responses from the xByte API.

```typescript
type ApiResponse<T, E> =
    | { status: "Success"; data: T }
    | { status: "Error" | "PaymentRequired"; data: E };
```

**Type Parameters:**

- `T`: The type of data returned on success
- `E`: The type of error data returned on failure

**Status Values:**

- `"Success"`: Operation completed successfully
- `"Error"`: An error occurred
- `"PaymentRequired"`: Payment is required to complete the operation

**Example:**

```typescript
const response: ApiResponse<string, string> = await client.health();

if (response.status === "Success") {
    const data: string = response.data;
} else {
    const error: string = response.data;
}
```

## Client Types

### `Client`

Represents a client in the xByte system.

```typescript
interface Client {
    id?: UUID;
    name: string;
    wallet: string;
}
```

**Properties:**

- `id` (optional): The unique identifier for the client (UUID)
- `name`: The name of the client
- `wallet`: The wallet address associated with the client

**Example:**

```typescript
const client: Client = {
    name: "My Content Platform",
    wallet: "0x1234567890123456789012345678901234567890",
};
```

## Request Types

### `RegisterRequest`

Request to register a new bucket.

```typescript
interface RegisterRequest {
    bucket: string;
    client: UUID;
}
```

**Properties:**

- `bucket`: The name of the bucket to register
- `client`: The UUID of the client that owns the bucket

**Example:**

```typescript
const request: RegisterRequest = {
    bucket: "my-content-bucket",
    client: "550e8400-e29b-41d4-a716-446655440000",
};
```

### `SetPriceRequest`

Request to set the price for a content object.

```typescript
interface SetPriceRequest {
    bucket: string;
    object: string;
    price: number;
}
```

**Properties:**

- `bucket`: The name of the bucket containing the object
- `object`: The name/path of the object
- `price`: The price per byte (in USDC)

**Example:**

```typescript
const request: SetPriceRequest = {
    bucket: "my-content-bucket",
    object: "my-video.mp4",
    price: 0.001,
};
```

### `RangeRequest`

Request for a byte range of content.

```typescript
interface RangeRequest {
    offset: number;
    length: number;
}
```

**Properties:**

- `offset`: The starting byte offset
- `length`: The number of bytes to retrieve

**Example:**

```typescript
const request: RangeRequest = {
    offset: 0,
    length: 1024 * 1024,
};
```

## Payment Types

### `X402PaymentPayload`

Represents an x402 payment authorization payload.

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

**Properties:**

- `x402Version`: The version of the x402 protocol
- `scheme`: The payment scheme (e.g., "exact")
- `network`: The blockchain network (e.g., "base-sepolia")
- `payload.signature`: The cryptographic signature
- `payload.authorization.from`: The payer's address
- `payload.authorization.to`: The recipient's address
- `payload.authorization.value`: The payment amount (as string)
- `payload.authorization.validAfter`: Timestamp when payment becomes valid
- `payload.authorization.validBefore`: Timestamp when payment expires
- `payload.authorization.nonce`: Unique nonce for the payment

**Example:**

```typescript
const payment: X402PaymentPayload = {
    x402Version: 1,
    scheme: "exact",
    network: "base-sepolia",
    payload: {
        signature: "0x1234...",
        authorization: {
            from: "0xabcd...",
            to: "0x5678...",
            value: "1000",
            validAfter: "0",
            validBefore: "1893456000",
            nonce: "0xef01...",
        },
    },
};
```

## Utility Types

### `UUID`

A type alias for UUID strings (from the `crypto` module).

```typescript
import { UUID } from "crypto";
```

**Example:**

```typescript
const clientId: UUID = "550e8400-e29b-41d4-a716-446655440000";
```

### `Address`

A type alias for Ethereum addresses (from `viem`).

```typescript
import { Address } from "viem";
```

**Example:**

```typescript
const wallet: Address = "0x1234567890123456789012345678901234567890";
```

## Type Guards

You can use TypeScript's type narrowing with the `ApiResponse` type:

```typescript
function handleResponse<T>(response: ApiResponse<T, string>) {
    if (response.status === "Success") {
        return response.data;
    } else {
        throw new Error(response.data);
    }
}
```

## Common Patterns

### Error Handling Pattern

```typescript
async function safeApiCall<T>(apiCall: () => Promise<ApiResponse<T, string>>): Promise<T> {
    const response = await apiCall();

    if (response.status === "Success") {
        return response.data;
    } else {
        throw new Error(`API Error: ${response.data}`);
    }
}

const price = await safeApiCall(() => client.getPrice("bucket", "object"));
```

### Type-Safe Response Handling

```typescript
function isSuccess<T, E>(response: ApiResponse<T, E>): response is { status: "Success"; data: T } {
    return response.status === "Success";
}

const response = await client.getPrice("bucket", "object");
if (isSuccess(response)) {
    console.log("Price:", response.data);
}
```
