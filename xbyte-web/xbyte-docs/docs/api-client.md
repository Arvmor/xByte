---
sidebar_position: 3
---

# API Client Reference

The `xByteClient` provides methods to interact with the xByte API server for content management, pricing, and retrieval.

## Constructor

### `new xByteClient(xbyteUrl?: string)`

Creates a new xByte API client instance.

**Parameters:**

- `xbyteUrl` (optional): The URL of the xByte API server. Defaults to `http://localhost:80`

**Example:**

```typescript
const client = new xByteClient("https://api.xbyte.com");
```

## Health & Version

### `health()`

Checks the health status of the xByte server.

**Returns:** `Promise<ApiResponse<string, string>>`

**Example:**

```typescript
const response = await client.health();
if (response.status === "Success") {
  console.log(response.data); // "OK"
}
```

### `version()`

Gets the version of the xByte API.

**Returns:** `Promise<ApiResponse<string, string>>`

**Example:**

```typescript
const response = await client.version();
if (response.status === "Success") {
  console.log(response.data); // "1.0.0"
}
```

## Client Management

### `createClient(request: Client)`

Creates a new client in the xByte system.

**Parameters:**

- `request`: A `Client` object with:
    - `name`: The name of the client
    - `wallet`: The wallet address associated with the client

**Returns:** `Promise<ApiResponse<Client, string>>`

**Example:**

```typescript
const response = await client.createClient({
  name: "My Content Platform",
  wallet: "0x1234567890123456789012345678901234567890",
});

if (response.status === "Success") {
  const clientData = response.data;
  console.log("Client ID:", clientData.id);
}
```

### `getClient(id: string)`

Retrieves a client by its ID.

**Parameters:**

- `id`: The UUID of the client

**Returns:** `Promise<ApiResponse<Client, string>>`

**Example:**

```typescript
const response = await client.getClient("550e8400-e29b-41d4-a716-446655440000");
if (response.status === "Success") {
  console.log("Client:", response.data);
}
```

## Bucket Management

### `registerBucket(request: RegisterRequest)`

Registers a new bucket for storing content.

**Parameters:**

- `request`: A `RegisterRequest` object with:
    - `bucket`: The name of the bucket
    - `client`: The UUID of the client that owns the bucket

**Returns:** `Promise<ApiResponse<string, string>>`

**Example:**

```typescript
const response = await client.registerBucket({
  bucket: "my-content-bucket",
  client: "550e8400-e29b-41d4-a716-446655440000",
});

if (response.status === "Success") {
  console.log("Bucket registered:", response.data);
}
```

### `getAllBuckets()`

Retrieves all buckets in the system.

**Returns:** `Promise<ApiResponse<string[], string>>`

**Example:**

```typescript
const response = await client.getAllBuckets();
if (response.status === "Success") {
  console.log("Buckets:", response.data);
}
```

### `getAllObjects(bucket: string)`

Gets all objects in a specific bucket.

**Parameters:**

- `bucket`: The name of the bucket

**Returns:** `Promise<ApiResponse<string[], string>>`

**Example:**

```typescript
const response = await client.getAllObjects("my-content-bucket");
if (response.status === "Success") {
  console.log("Objects:", response.data);
}
```

## Price Management

### `setPrice(request: SetPriceRequest)`

Sets the per-byte price for a content object.

**Parameters:**

- `request`: A `SetPriceRequest` object with:
    - `bucket`: The name of the bucket containing the object
    - `object`: The name/path of the object
    - `price`: The price per byte (in USDC)

**Returns:** `Promise<ApiResponse<string, string>>`

**Example:**

```typescript
const response = await client.setPrice({
  bucket: "my-content-bucket",
  object: "my-video.mp4",
  price: 0.001,
});

if (response.status === "Success") {
  console.log("Price set successfully");
}
```

### `getPrice(bucket: string, object: string)`

Retrieves the price for a specific content object.

**Parameters:**

- `bucket`: The name of the bucket
- `object`: The name/path of the object

**Returns:** `Promise<ApiResponse<number, string>>`

**Example:**

```typescript
const response = await client.getPrice("my-content-bucket", "my-video.mp4");
if (response.status === "Success") {
  console.log("Price per byte:", response.data);
}
```

## Response Types

All methods return an `ApiResponse<T, E>` which can have one of three statuses:

- `"Success"`: The operation completed successfully. Access data via `response.data`
- `"Error"`: An error occurred. Error details are in `response.data`
- `"PaymentRequired"`: Payment is required to complete the operation

**Example error handling:**

```typescript
const response = await client.getPrice("bucket", "object");

switch (response.status) {
  case "Success":
    console.log("Price:", response.data);
    break;
  case "Error":
    console.error("Error:", response.data);
    break;
  case "PaymentRequired":
    console.log("Payment required:", response.data);
    break;
}
```
