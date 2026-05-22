# Ecommerce API — Integration Reference

> **Base URL**: `http://localhost:3000`
> **Auth Header**: `Authorization: Bearer <accessToken>`
> **Timestamps**: All objects and responses include `createdAt` and `updatedAt` (ISO 8601) unless noted.
> **Paginated responses in all /all apis**: `{ page, total, totalPages, data: T[] }`
> **Error shape**: `{ statusCode, message, error }`
---

## Auth `/auth`

| Method | Endpoint | Auth | Body |
|--------|----------|------|------|
| POST | `/register` | — | `{ name, email, password }` |
| POST | `/login` | — | `{ email, password }` |
| POST | `/refresh-token` | Bearer refreshToken | — |
| POST | `/logout` | ✓ | — |
| POST | `/forgot-password` | — | `{ email }` |
| POST | `/verify-otp` | — | `{ email, otp }` |
| POST | `/reset-password` | — | `{ email, newPassword }` |
| POST | `/resend-otp` | — | `{ email }` |
| POST | `/change-password` | ✓ | `{ oldPassword, newPassword }` |

**Auth flow**
```
Register/Login → store accessToken (memory) + refreshToken (secure storage)
Expired token  → POST /auth/refresh-token (Bearer refreshToken) → new pair
Logout         → POST /auth/logout → discard tokens
```

**POST `/register` — 201**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiJ9...",
  "user": {
    "_id": "664f1b2c8e4b2a001f3d9a01",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "photo": "https://bucket.s3.amazonaws.com/users/jane.jpg",
    "role": "user",
  }
}
```

**POST `/login` — 201** — same shape as `/register`

**POST `/refresh-token` — 200**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiJ9..."
}
```

**POST `/logout` | `/forgot-password` | `/verify-otp` | `/reset-password` | `/resend-otp` | `/change-password` — 200**
```json
{ "message": "Success" }
```

---

## Users `/users`

| Method | Endpoint | Auth | Notes |
|--------|----------|------|-------|
| GET | `/me` | ✓ | Current user profile |
| PATCH | `/update-me` | ✓ | Body: `{ name?, photo? }` |
| GET | `/admin/all` | Admin | Query: `page, limit, search` |
| GET | `/admin/:id` | Admin | Single user |

**GET `/me` · PATCH `/update-me` · GET `/admin/:id` — 200**
```json
{
  "user": {
    "_id": "664f1b2c8e4b2a001f3d9a01",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "photo": "https://bucket.s3.amazonaws.com/users/jane.jpg",
    "role": "user",
  }
}
```

**GET `/admin/all` — 200**
```json
{

  "data": [
    {
      "_id": "664f1b2c8e4b2a001f3d9a01",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "photo": "https://bucket.s3.amazonaws.com/users/jane.jpg",
      "role": "user",
    }
  ]
}
```

---

## Products `/product`

| Method | Endpoint | Auth | Notes |
|--------|----------|------|-------|
| GET | `/all` | — | Query: `page, limit, search` |
| GET | `/:id` | — | Single product |
| POST | `/` | Admin | Create product |
| PATCH | `/:id` | Admin | Update product |
| PATCH | `/stock/:id` | Admin | Body: `{ stock }` |
| DELETE | `/:id` | Admin | — |

**Create/Update fields**

| Field | Required | Notes |
|-------|----------|-------|
| `title` | Yes | Max 50 chars |
| `sku` | Yes | Unique, max 50 chars |
| `stock` | Yes (create) | Integer ≥ 1 |
| `categoryId` | Yes (create) | ObjectId |
| `price` | Yes (create) | Min 1, 2 decimals |
| `description` | No | Max 255 chars |
| `imageUrl` | No | URL |
| `isActive` | No | Default: `true` |

**GET `/:id` · POST `/` · PATCH `/:id` · PATCH `/stock/:id` · DELETE `/:id` — 200/201**
```json
{
  "product": {
    "_id": "664f1b2c8e4b2a001f3d9b10",
    "title": "Wireless Headphones",
    "description": "Noise-cancelling over-ear headphones",
    "sku": "WH-1000XM5",
    "stock": 50,
    "price": 349.99,
    "imageUrl": "https://bucket.s3.amazonaws.com/products/wh.jpg",
    "slug": "wireless-headphones",
    "isActive": true,
    "likesCount": 12,
    "commentsCount": 4,
    "category": {
      "_id": "664f1b2c8e4b2a001f3d9c01",
      "title": "Electronics"
    },
  }
}
```

**GET `/all` — 200**
```json
{
  "data": [
    {
      "_id": "664f1b2c8e4b2a001f3d9b10",
      "title": "Wireless Headphones",
      "description": "Noise-cancelling over-ear headphones",
      "sku": "WH-1000XM5",
      "stock": 50,
      "price": 349.99,
      "imageUrl": "https://bucket.s3.amazonaws.com/products/wh.jpg",
      "slug": "wireless-headphones",
      "isActive": true,
      "likesCount": 12,
      "commentsCount": 4,
      "category": { "_id": "664f1b2c8e4b2a001f3d9c01", "title": "Electronics" },
    }
  ]
}
```

---

## Categories `/categories`

| Method | Endpoint | Auth | Notes |
|--------|----------|------|-------|
| GET | `/all` | — | Query: `page, limit, search` |
| GET | `/:id` | — | Single category |
| POST | `/` | Admin | Create category |
| PATCH | `/:id` | Admin | Update category |
| DELETE | `/:id` | Admin | — |

**Create/Update fields**: `title` (required, max 50), `description` (max 255), `imageUrl`, `isActive`

**GET `/:id` · POST `/` · PATCH `/:id` · DELETE `/:id` — 200/201**
```json
{
  "category": {
    "_id": "664f1b2c8e4b2a001f3d9c01",
    "title": "Electronics",
    "description": "Gadgets and electronic devices",
    "imageUrl": "https://bucket.s3.amazonaws.com/categories/electronics.jpg",
    "slug": "electronics",
    "isActive": true,
  }
}
```

**GET `/all` — 200**
```json
{
  "data": [
    {
      "_id": "664f1b2c8e4b2a001f3d9c01",
      "title": "Electronics",
      "description": "Gadgets and electronic devices",
      "imageUrl": "https://bucket.s3.amazonaws.com/categories/electronics.jpg",
      "slug": "electronics",
      "isActive": true,
    }
  ]
}
```

---

## Cart `/cart`

All endpoints require auth.

| Method | Endpoint | Body / Param | Notes |
|--------|----------|--------------|-------|
| GET | `/` | — | Get current cart |
| PATCH | `/items` | `{ productId, quantity }` | Add or update item (upsert) |
| DELETE | `/items/:productId` | — | Remove one item |
| DELETE | `/` | — | Clear cart |

**All cart endpoints — 200**
```json
{
  "cart": {
    "_id": "664f1b2c8e4b2a001f3d9d01",
    "user": "664f1b2c8e4b2a001f3d9a01",
    "checkedOut": false,
    "items": [
      {
        "product": {
          "_id": "664f1b2c8e4b2a001f3d9b10",
          "title": "Wireless Headphones",
          "price": 349.99,
          "imageUrl": "https://bucket.s3.amazonaws.com/products/wh.jpg"
        },
        "quantity": 2,
        "price": 349.99
      }
    ],
  }
}
```

---

## Orders `/orders`

| Method | Endpoint | Auth | Notes |
|--------|----------|------|-------|
| POST | `/create` | ✓ | Body: `{ shippingAddress? }` — creates from cart |
| GET | `/all` | ✓ | Query: `page, limit, status` — status: `pending\|completed\|cancelled` |
| GET | `/:orderId` | ✓ | Single order |
| PATCH | `/cancel/:orderId` | ✓ | Cancel order |

**POST `/create` · GET `/:orderId` · PATCH `/cancel/:orderId` — 200/201**
```json
{
  "order": {
    "_id": "664f1b2c8e4b2a001f3d9e01",
    "orderNumber": "ORD-20240523-001",
    "user": "664f1b2c8e4b2a001f3d9a01",
    "items": [
      {
        "product": "664f1b2c8e4b2a001f3d9b10",
        "quantity": 2,
        "price": 349.99
      }
    ],
    "totalAmount": 699.98,
    "status": "pending",
    "shippingAddress": "123 Main St, Springfield, USA",
  }
}
```

**GET `/all` — 200**
```json
{
  "data": [
    {
      "_id": "664f1b2c8e4b2a001f3d9e01",
      "orderNumber": "ORD-20240523-001",
      "user": "664f1b2c8e4b2a001f3d9a01",
      "items": [
        { "product": "664f1b2c8e4b2a001f3d9b10", "quantity": 2, "price": 349.99 }
      ],
      "totalAmount": 699.98,
      "status": "pending",
      "shippingAddress": "123 Main St, Springfield, USA",
    }
  ]
}
```

---

## Payment `/payment`

| Method | Endpoint | Auth | Notes |
|--------|----------|------|-------|
| POST | `/create-intent` | ✓ | Body: `{ orderId, currency? }` |
| POST | `/refund/:orderId` | ✓ | — |

**POST `/create-intent` — 200**
```json
{
  "message": "Payment intent created",
  "success": true,
  "data": {
    "url": "https://checkout.stripe.com/pay/cs_test_abc123...",
    "paymentId": "664f1b2c8e4b2a001f3d9f01"
  }
}
```

> Redirect the user to `data.url` to complete Stripe checkout.

**POST `/refund/:orderId` — 200**
```json
{
  "message": "Refund processed successfully",
  "success": true
}
```

---

## Comments `/comment`

| Method | Endpoint | Auth | Notes |
|--------|----------|------|-------|
| GET | `/:productId` | — | Query: `page, limit` |
| POST | `/` | ✓ | Body: `{ content, productId, parentId? }` |
| PATCH | `/:commentId` | ✓ (owner) | Body: `{ content }` |
| DELETE | `/:commentId` | ✓ (owner) | — |

**POST `/` · PATCH `/:commentId` · DELETE `/:commentId` — 200/201**
```json
{
  "comment": {
    "_id": "664f1b2c8e4b2a001f3da001",
    "content": "Great product, highly recommend!",
    "user": "664f1b2c8e4b2a001f3d9a01",
    "product": "664f1b2c8e4b2a001f3d9b10",
    "parent": null,
    "likesCount": 3,
    "replyCount": 1,
  }
}
```

**GET `/:productId` — 200**
```json
{
  "data": [
    {
      "_id": "664f1b2c8e4b2a001f3da001",
      "content": "Great product, highly recommend!",
      "user": {
        "_id": "664f1b2c8e4b2a001f3d9a01",
        "name": "Jane Doe",
        "photo": "https://bucket.s3.amazonaws.com/users/jane.jpg"
      },
      "product": "664f1b2c8e4b2a001f3d9b10",
      "parent": null,
      "likesCount": 3,
      "replyCount": 1,
    }
  ]
}
```

---

## Likes `/like`

| Method | Endpoint | Auth | Response |
|--------|----------|------|----------|
| PATCH | `/products/:productId` | ✓ | `{ likesCount, productId, hasLiked }` |
| PATCH | `/comments/:commentId` | ✓ | `{ likesCount, commentId, hasLiked }` |
| GET | `/products/:productId` | — | Array of like objects |
| GET | `/comments/:commentId` | — | Array of like objects |

**PATCH `/products/:productId` — 200**
```json
{
  "likesCount": 13,
  "productId": "664f1b2c8e4b2a001f3d9b10",
  "hasLiked": true
}
```

**PATCH `/comments/:commentId` — 200**
```json
{
  "likesCount": 4,
  "commentId": "664f1b2c8e4b2a001f3da001",
  "hasLiked": true
}
```

**GET `/products/:productId` · GET `/comments/:commentId` — 200**
```json
[
  {
    "_id": "664f1b2c8e4b2a001f3db001",
    "user": "664f1b2c8e4b2a001f3d9a01",
    "product": "664f1b2c8e4b2a001f3d9b10",
  }
]
```

---

## Rooms / Chat `/rooms`

| Method | Endpoint | Auth | Notes |
|--------|----------|------|-------|
| GET | `/all` | ✓ | Query: `page, limit, search` |
| POST | `/` | ✓ | Body: `{ userId, content, attachment? }` — creates room + first message |
| GET | `/messages/:roomId` | ✓ | Query: `page, limit, search` |

**POST `/` — 201**
```json
{
  "room": {
    "_id": "664f1b2c8e4b2a001f3dc001",
    "participants": [
      { "_id": "664f1b2c8e4b2a001f3d9a01", "name": "Jane Doe" },
      { "_id": "664f1b2c8e4b2a001f3d9a02", "name": "John Smith" }
    ],
    "latestMessage": {
      "_id": "664f1b2c8e4b2a001f3dd001",
      "content": "Hey, is this item still available?",
      "attachment": null,
      "readBy": ["664f1b2c8e4b2a001f3d9a01"],
      "sender": "664f1b2c8e4b2a001f3d9a01",
      "room": "664f1b2c8e4b2a001f3dc001",
    },
    "unreadCount": 0,
  }
}
```

**GET `/all` — 200**
```json
{
  "data": [
    {
      "_id": "664f1b2c8e4b2a001f3dc001",
      "participants": [
        { "_id": "664f1b2c8e4b2a001f3d9a01", "name": "Jane Doe" },
        { "_id": "664f1b2c8e4b2a001f3d9a02", "name": "John Smith" }
      ],
      "latestMessage": {
        "_id": "664f1b2c8e4b2a001f3dd001",
        "content": "Hey, is this item still available?",
        "attachment": null,
        "readBy": ["664f1b2c8e4b2a001f3d9a01"],
        "sender": "664f1b2c8e4b2a001f3d9a01",
        "room": "664f1b2c8e4b2a001f3dc001",
      },
      "unreadCount": 1,
    }
  ]
}
```

**GET `/messages/:roomId` — 200**
```json
{
  "data": [
    {
      "_id": "664f1b2c8e4b2a001f3dd001",
      "content": "Hey, is this item still available?",
      "attachment": null,
      "readBy": ["664f1b2c8e4b2a001f3d9a01"],
      "sender": {
        "_id": "664f1b2c8e4b2a001f3d9a01",
        "name": "Jane Doe",
        "photo": "https://bucket.s3.amazonaws.com/users/jane.jpg"
      },
      "room": "664f1b2c8e4b2a001f3dc001",
    }
  ]
}
```

---

## Upload `/upload`

| Method | Endpoint | Auth | Notes |
|--------|----------|------|-------|
| POST | `/signed-url` | ✓ | Get pre-signed S3 URL; then PUT file directly to returned `url` |
| POST | `/files` | ✓ | `multipart/form-data` — `files[]`, `keys[]?` |
| GET | `/read` | — | Query: `key` → returns signed read URL |
| DELETE | `/` | — | Query: `key` |

**Signed URL request body**: `{ files: [{ fileName, fileType, mimeType }], keys?: [] }`

**POST `/signed-url` — 200**
```json
[
  {
    "key": "uploads/products/wh-1000xm5-664f1b2c.jpg",
    "url": "https://bucket.s3.amazonaws.com/uploads/products/wh-1000xm5-664f1b2c.jpg?X-Amz-Signature=..."
  }
]
```

> PUT the file binary directly to `url`. Save `key` for future reference (e.g. as `imageUrl` on a product).

**POST `/files` — 200**
```json
[
  {
    "key": "uploads/products/wh-1000xm5-664f1b2c.jpg",
    "fileName": "wh-1000xm5.jpg"
  }
]
```

**GET `/read` — 200**
```json
{
  "url": "https://bucket.s3.amazonaws.com/uploads/products/wh-1000xm5-664f1b2c.jpg?X-Amz-Signature=..."
}
```

**DELETE `/` — 200**
```json
{ "message": "File deleted successfully" }
```

---

## Chat WebSocket

**Namespace**: `/` (default)
**Transport**: Socket.IO
**Auth**: Pass JWT access token in the handshake — either `socket.auth.token` or the `Authorization: Bearer <token>` header.

```js
const socket = io('http://localhost:3000', {
  auth: { token: '<accessToken>' }
})
```

---

### Connection lifecycle

| Event | Direction | Payload | Notes |
|-------|-----------|---------|-------|
| `connection:success` | Server → Client | `{ userId, socketId }` | Fired after successful auth; socket is auto-joined to all existing rooms |
| `connection:failed` | Server → Client | `{ message }` | Fired when token is missing or invalid |

On connect the server automatically joins the socket to every room the user is a participant of, so no manual `room.join` call is needed for existing rooms.

---

### Client → Server (emitters)

#### `message.send`
Send a message to a room.

```js
socket.emit('message.send', { roomId, content, attachment? })
// ack: { success: true } | { success: false, message }
```

| Field | Required | Type |
|-------|----------|------|
| `roomId` | Yes | string |
| `content` | Yes* | string |
| `attachment` | No | string (URL) |

\* At least one of `content` or `attachment` is required.

---

#### `room.join`
Explicitly join a room socket namespace (needed for rooms created after the current connection).

```js
socket.emit('room.join', { roomId })
// ack: { success: true } | { success: false, message }
```

---

#### `message.read_all`
Mark all messages in a room as read for the current user.

```js
socket.emit('message.read_all', { roomId })
// ack: { success: true } | { success: false, message }
```

---

#### `message.typing.start` / `message.typing.stop`
Broadcast typing state to other room participants.

```js
socket.emit('message.typing.start', { roomId })
socket.emit('message.typing.stop',  { roomId })
// ack: { success: true } | { success: false, message }
```

---

### Server → Client (listeners)

#### `message.receive`
A new message was sent in a room. Emitted to all room participants.

```json
{
  "roomId": "664f1b2c8e4b2a001f3dc001",
  "message": {
    "_id": "664f1b2c8e4b2a001f3dd002",
    "content": "Is this still in stock?",
    "attachment": null,
    "readBy": ["664f1b2c8e4b2a001f3d9a01"],
    "sender": "664f1b2c8e4b2a001f3d9a01",
    "room": "664f1b2c8e4b2a001f3dc001"
  }
}
```

---

#### `message.read`
Messages in a room were marked as read. Emitted to all room participants.

```json
{
  "roomId": "664f1b2c8e4b2a001f3dc001",
  "userId": "664f1b2c8e4b2a001f3d9a01",
  "messageIds": ["664f1b2c8e4b2a001f3dd001", "664f1b2c8e4b2a001f3dd002"]
}
```

---

#### `room.updated`
A room's metadata changed (new message sent or new room created). Emitted to all room participants.

```json
{
  "room": {
    "_id": "664f1b2c8e4b2a001f3dc001",
    "participants": [
      { "_id": "664f1b2c8e4b2a001f3d9a01", "name": "Jane Doe" },
      { "_id": "664f1b2c8e4b2a001f3d9a02", "name": "John Smith" }
    ],
    "latestMessage": {
      "_id": "664f1b2c8e4b2a001f3dd002",
      "content": "Is this still in stock?",
      "attachment": null,
      "readBy": ["664f1b2c8e4b2a001f3d9a01"],
      "sender": "664f1b2c8e4b2a001f3d9a01",
      "room": "664f1b2c8e4b2a001f3dc001"
    },
    "unreadCount": 1
  }
}
```

---

#### `message.typing.started` / `message.typing.stopped`
Another user in the room started or stopped typing. Emitted to all room participants **except** the sender.

```json
{ "roomId": "664f1b2c8e4b2a001f3dc001", "userId": "664f1b2c8e4b2a001f3d9a02" }
```

---

#### `error`
Catches unhandled exceptions. Emitted to the socket that triggered the error.

```json
{ "message": "Unauthorized", "statusCode": 401, "timestamp": "2024-05-23T10:00:00.000Z" }
```

---

### Event quick-reference

| Event | Direction | Scope | Payload |
|-------|-----------|-------|---------|
| `connection:success` | S → C | Socket | `{ userId, socketId }` |
| `connection:failed` | S → C | Socket | `{ message }` |
| `message.send` | C → S | — | `{ roomId, content, attachment? }` |
| `room.join` | C → S | — | `{ roomId }` |
| `message.read_all` | C → S | — | `{ roomId }` |
| `message.typing.start` | C → S | — | `{ roomId }` |
| `message.typing.stop` | C → S | — | `{ roomId }` |
| `message.receive` | S → C | Room | `{ message, roomId }` |
| `message.read` | S → C | Room | `{ messageIds[], roomId, userId }` |
| `room.updated` | S → C | Room / User | `{ room }` |
| `message.typing.started` | S → C | Room (excl. sender) | `{ roomId, userId }` |
| `message.typing.stopped` | S → C | Room (excl. sender) | `{ roomId, userId }` |
| `message.send-failed` | S → C | Socket | `{ message }` |
| `message.read-failed` | S → C | Socket | `{ message }` |
| `rooms.join-failed` | S → C | Socket | `{ message }` |
| `error` | S → C | Socket | `{ message, statusCode, timestamp }` |

---

## Rate Limits

| Level | Endpoints |
|-------|-----------|
| Strict | Payment, Upload (write) |
| Moderate | Auth, Cart, Orders |
| Relaxed | Upload (read) |
