# OpenGPU API Documentation

## Base URL

```
https://api.opengpu.io/v1
```

For development:
```
http://localhost:3000/v1
```

## Authentication

All API requests require authentication via Bearer token.

```bash
curl -H "Authorization: Bearer YOUR_API_TOKEN" \
     https://api.opengpu.io/v1/gpus
```

### Obtaining a Token

```bash
# Login to get a token
curl -X POST https://api.opengpu.io/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password"}'
```

Response:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "usr_abc123",
      "email": "user@example.com",
      "name": "John Doe",
      "balance": 100.00,
      "credits": 500
    }
  }
}
```

## Rate Limiting

- **Authenticated**: 1000 requests/minute
- **Unauthenticated**: 60 requests/minute

Rate limit headers:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640000000
```

## Error Handling

All errors follow this format:

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {}
}
```

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 429 | Rate Limited |
| 500 | Internal Server Error |

## Endpoints

### Authentication

#### POST /auth/login

Login with email and password.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "usr_abc123",
      "email": "user@example.com",
      "name": "John Doe",
      "balance": 100.00,
      "credits": 500,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  }
}
```

#### GET /auth/me

Get current user information.

**Headers:**
```
Authorization: Bearer TOKEN
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "usr_abc123",
    "email": "user@example.com",
    "name": "John Doe",
    "balance": 100.00,
    "credits": 500,
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### GPUs

#### GET /gpus

List available GPUs.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| model | string | Filter by GPU model |
| minMemory | number | Minimum memory in GB |
| maxPrice | number | Maximum price per hour |
| region | string | Filter by region |
| available | boolean | Show only available |

**Example:**
```bash
curl "https://api.opengpu.io/v1/gpus?model=RTX+4090&maxPrice=1.00"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "gpu_xyz789",
      "model": "RTX 4090",
      "brand": "NVIDIA",
      "memory": 24,
      "memoryType": "GDDR6X",
      "cores": 16384,
      "pricePerHour": 0.75,
      "pricePerDay": 16.00,
      "availability": "available",
      "region": "us-east-1",
      "providerId": "prv_abc123",
      "providerName": "FastGPU Inc",
      "specs": {
        "tflops": 82.6,
        "bandwidth": 1008,
        "tdp": 450
      }
    }
  ]
}
```

#### GET /gpus/:id

Get specific GPU details.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "gpu_xyz789",
    "model": "RTX 4090",
    "brand": "NVIDIA",
    "memory": 24,
    "memoryType": "GDDR6X",
    "cores": 16384,
    "pricePerHour": 0.75,
    "pricePerDay": 16.00,
    "availability": "available",
    "region": "us-east-1",
    "providerId": "prv_abc123",
    "providerName": "FastGPU Inc",
    "specs": {
      "tflops": 82.6,
      "bandwidth": 1008,
      "tdp": 450
    },
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

### Rentals

#### POST /rentals

Create a new rental.

**Request:**
```json
{
  "gpuId": "gpu_xyz789",
  "duration": "1h"
}
```

**Duration Options:**
- `1h` - 1 hour
- `6h` - 6 hours
- `12h` - 12 hours
- `1d` - 1 day
- `3d` - 3 days
- `7d` - 7 days
- `30d` - 30 days

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "rental_abc123",
    "gpuId": "gpu_xyz789",
    "gpuModel": "RTX 4090",
    "status": "active",
    "startTime": "2024-01-15T10:00:00Z",
    "endTime": "2024-01-15T11:00:00Z",
    "duration": "1h",
    "cost": 0.75,
    "connectionInfo": {
      "host": "gpu-123.opengpu.io",
      "port": 2222,
      "sshKey": "ogpu_key_rental_abc123"
    }
  }
}
```

#### GET /rentals

List user's rentals.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| status | string | Filter by status (active, stopped, expired) |

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "rental_abc123",
      "gpuId": "gpu_xyz789",
      "gpuModel": "RTX 4090",
      "status": "active",
      "startTime": "2024-01-15T10:00:00Z",
      "endTime": "2024-01-15T11:00:00Z",
      "duration": "1h",
      "cost": 0.75,
      "connectionInfo": {
        "host": "gpu-123.opengpu.io",
        "port": 2222,
        "sshKey": "ogpu_key_rental_abc123"
      }
    }
  ]
}
```

#### GET /rentals/:id

Get specific rental details.

#### POST /rentals/:id/stop

Stop an active rental.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "rental_abc123",
    "status": "stopped",
    "endTime": "2024-01-15T10:30:00Z",
    "finalCost": 0.375
  }
}
```

### Nodes (Provider)

#### GET /nodes

List provider's nodes.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "node_abc123",
      "name": "Server 1",
      "status": "sharing",
      "gpuCount": 4,
      "gpuModels": ["RTX 4090"],
      "totalMemory": 96,
      "uptime": 86400,
      "earnings": 45.50,
      "region": "us-east-1"
    }
  ]
}
```

#### POST /nodes/:id/start

Start sharing a node.

#### POST /nodes/:id/stop

Stop sharing a node.

### Metrics

#### GET /rentals/:id/metrics

Get GPU metrics for a rental.

**Query Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| period | string | Time period (1h, 6h, 24h, 7d) |

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "timestamp": "2024-01-15T10:00:00Z",
      "gpuUtilization": 85,
      "memoryUtilization": 72,
      "temperature": 68,
      "powerDraw": 350,
      "fanSpeed": 60,
      "networkIn": 125.5,
      "networkOut": 45.2
    }
  ]
}
```

### User

#### GET /user/balance

Get user balance.

**Response:**
```json
{
  "success": true,
  "data": {
    "balance": 100.00,
    "credits": 500,
    "currency": "USD"
  }
}
```

#### POST /user/deposit

Add funds to account.

**Request:**
```json
{
  "amount": 50.00,
  "paymentMethod": "stripe",
  "paymentToken": "pm_card_visa"
}
```

## Webhooks

Webhooks are sent for important events.

### Webhook Events

| Event | Description |
|-------|-------------|
| `rental.created` | New rental started |
| `rental.stopped` | Rental stopped |
| `rental.expired` | Rental expired |
| `payment.completed` | Payment processed |
| `node.online` | Node came online |
| `node.offline` | Node went offline |

### Webhook Payload

```json
{
  "event": "rental.created",
  "timestamp": "2024-01-15T10:00:00Z",
  "data": {
    "rentalId": "rental_abc123",
    "gpuId": "gpu_xyz789",
    "userId": "usr_abc123",
    "amount": 0.75
  }
}
```

### Webhook Headers

```
Content-Type: application/json
X-OpenGPU-Signature: sha256=...
X-OpenGPU-Timestamp: 1640000000
```

## SDKs

Official SDKs are available for:

- JavaScript/TypeScript: `@opengpu/sdk`
- Python: `opengpu`
- Go: `github.com/opengpu/opengpu-go`

## Rate Limits

| Endpoint | Limit |
|----------|-------|
| GET /gpus | 100/min |
| POST /rentals | 10/min |
| GET /rentals | 60/min |
| GET /metrics | 30/min |

## Versioning

API version is included in the URL: `/v1/...`

Breaking changes will increment the version number.
