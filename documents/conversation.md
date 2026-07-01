# 💬 Conversation Management API

<div align="center">

## Complete Conversation Management System

A flexible **Conversation Management API** supporting both authenticated users and guests, with full CRUD operations, message history, conversation tracking, and state management.

<br/>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-18.x-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Express-4.x-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express.js" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/PostgreSQL-15-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Redis-7-DC382D?style=for-the-badge&logo=redis&logoColor=white" alt="Redis" />

</p>

<p align="center">
  <strong>Guest Support</strong> •
  <strong>CRUD Operations</strong> •
  <strong>Message History</strong> •
  <strong>Conversation State Management</strong> •
  <strong>Dual Storage</strong>
</p>

---

</div>

## 📋 Table of Contents

<div align="center">

| Section | About |
|:---|:---|
| [Overview](#overview) | Introduction to conversation management |
| [Features](#features) | Core conversation capabilities |
| [Tech Stack](#tech-stack) | Technologies used |
| [API Reference](#api-reference) | Available conversation endpoints |
| [Request Examples](#request--response-examples) | API usage examples |
| [Error Handling](#error-handling) | Error responses and status codes |
| [Storage Strategies](#storage-strategies) | Database vs Redis storage approach |

</div>

## 📌 Overview

The **Conversation Management API** provides a complete solution for managing chat conversations with support for both authenticated users and guest users.

Built with **Express.js**, **TypeScript**, and **Prisma ORM**, it provides flexible storage capabilities using **PostgreSQL** and **Redis**, along with conversation state tracking and complete message history management.

## ✨ Key Highlights

<div align="center">

| Feature | Description |
|:---|:---|
| 👤 Guest Support | Create and manage conversations without authentication |
| 🔐 Authenticated Users | Full conversation management for registered users |
| 💬 Message History | Store and retrieve complete conversation messages |
| 📊 Dual Storage | Support for PostgreSQL and Redis-based storage |
| 🔄 State Management | Track conversation status such as active or closed |
| 🏷️ Title Management | Create and update conversation titles dynamically |
| 📚 Swagger Documentation | Interactive API documentation |

</div>

## ✨ Features

### 📝 Conversation Management

<div align="center">

| Feature | Description |
|:---|:---|
| ✅ Create Conversation | Start new conversations with optional titles |
| ✅ List Conversations | Retrieve all conversations with pagination support |
| ✅ Get Conversation | Fetch a conversation along with complete message history |
| ✅ Update Title | Modify conversation titles dynamically |
| ✅ Close Conversation | Mark conversations as inactive or closed |
| ✅ Delete Conversation | Permanently remove conversations |

</div>


### 👥 User Support

<div align="center">

| Feature | Description |
|:---|:---|
| ✅ Authenticated Users | Full CRUD operations with user context |
| ✅ Guest Users | Session-based conversation storage |
| ✅ Session Management | Identify guest users using session IDs |
| ✅ Data Isolation | Maintain separate data for each user or guest |

</div>


### 💾 Storage Options

<div align="center">

| Feature | Description |
|:---|:---|
| ✅ PostgreSQL | Persistent storage for conversations and messages |
| ✅ Redis Cache | High-speed in-memory conversation storage |
| ✅ Dual Support | Support for multiple storage strategies |
| ✅ Flexible Configuration | Configure storage based on application requirements |

</div>

## 📖 API Reference

### 📝 Conversation Endpoints

| Method | Endpoint | Description | Auth |
|:---|:---|:---|:---|
| POST | `/api/conversations` | Create new conversation | Optional |
| GET | `/api/conversations` | List all conversations | Optional |
| GET | `/api/conversations/:id` | Get conversation with messages | Optional |
| PATCH | `/api/conversations/:id/title` | Update conversation title | Optional |
| POST | `/api/conversations/:id/close` | Close conversation | Optional |
| DELETE | `/api/conversations/:id` | Delete conversation | Optional |


# 📋 Endpoint Details


## ➕ Create Conversation

```http
POST /api/conversations
```

### Request Body

| Parameter | Type | Required | Description |
|:---|:---|:---|:---|
| session_id | string | Guest users | Unique session identifier |
| title | string | No | Conversation title (default: `New Chat`) |


### Response (201 Created)

```json
{
  "success": true,
  "message": "Conversation created successfully",
  "data": {
    "storage": "db",
    "conversation": {
      "id": "conv_123",
      "title": "My New Chat",
      "status": "active",
      "created_at": "2026-01-14T10:00:00.000Z",
      "updated_at": "2026-01-14T10:00:00.000Z"
    },
    "isGuest": false
  },
  "error": null
}
```


---

## 📚 List Conversations

```http
GET /api/conversations?session_id={session_id}
```

### Query Parameters

| Parameter | Type | Required | Description |
|:---|:---|:---|:---|
| session_id | string | Guest users | Unique session identifier |


### Response (200 OK)

```json
{
  "success": true,
  "message": "Conversations retrieved successfully",
  "data": [
    {
      "id": "conv_123",
      "title": "My New Chat",
      "status": "active",
      "created_at": "2026-01-14T10:00:00.000Z",
      "updated_at": "2026-01-14T10:05:00.000Z",
      "last_message": "Hello, how can I help?",
      "last_message_role": "assistant",
      "message_count": 5
    }
  ],
  "pagination": {
    "total": 10
  },
  "is_guest": false,
  "error": null
}
```


---

## 🔍 Get Single Conversation

```http
GET /api/conversations/:id?session_id={session_id}
```

### Path Parameters

| Parameter | Type | Required | Description |
|:---|:---|:---|:---|
| id | string | ✅ | Conversation ID |


### Query Parameters

| Parameter | Type | Required | Description |
|:---|:---|:---|:---|
| session_id | string | Guest users | Unique session identifier |


### Response (200 OK)

```json
{
  "success": true,
  "message": "Conversation retrieved successfully",
  "data": {
    "id": "conv_123",
    "title": "My New Chat",
    "status": "active",
    "messages": [
      {
        "id": "msg_456",
        "role": "user",
        "content": "Hello!",
        "created_at": "2026-01-14T10:00:00.000Z"
      },
      {
        "id": "msg_457",
        "role": "assistant",
        "content": "Hi! How can I help you?",
        "created_at": "2026-01-14T10:01:00.000Z"
      }
    ]
  },
  "is_guest": false,
  "error": null
}
```


---

## ✏️ Update Conversation Title

```http
PATCH /api/conversations/:id/title
```

### Path Parameters

| Parameter | Type | Required | Description |
|:---|:---|:---|:---|
| id | string | ✅ | Conversation ID |


### Request Body

| Parameter | Type | Required | Description |
|:---|:---|:---|:---|
| title | string | ✅ | New conversation title |
| session_id | string | Guest users | Unique session identifier |


### Response (200 OK)

```json
{
  "success": true,
  "message": "Title updated successfully",
  "data": {
    "id": "conv_123",
    "title": "Updated Chat Title",
    "status": "active"
  },
  "is_guest": false,
  "error": null
}
```


---

## 🔒 Close Conversation

```http
POST /api/conversations/:id/close
```

### Request Body

| Parameter | Type | Required | Description |
|:---|:---|:---|:---|
| session_id | string | Guest users | Unique session identifier |


### Response (200 OK)

```json
{
  "success": true,
  "message": "Conversation closed successfully",
  "data": null,
  "error": null
}
```


---

## 🗑️ Delete Conversation

```http
DELETE /api/conversations/:id?session_id={session_id}
```

### Path Parameters

| Parameter | Type | Required | Description |
|:---|:---|:---|:---|
| id | string | ✅ | Conversation ID |


### Query Parameters

| Parameter | Type | Required | Description |
|:---|:---|:---|:---|
| session_id | string | Guest users | Unique session identifier |


### Response (200 OK)

```json
{
  "success": true,
  "message": "Conversation deleted successfully",
  "data": null,
  "error": null
}
```

## 📤 Request & Response Examples

### 👤 Guest User Creating a Conversation

### Request

```http
POST /api/conversations
Content-Type: application/json
```

```json
{
  "session_id": "guest-session-123",
  "title": "Guest Support Chat"
}
```


### Response (201 Created)

```json
{
  "success": true,
  "message": "Conversation created successfully",
  "data": {
    "storage": "db",
    "conversation": {
      "id": "conv_789",
      "title": "Guest Support Chat",
      "status": "active",
      "created_at": "2026-01-14T11:00:00.000Z",
      "updated_at": "2026-01-14T11:00:00.000Z"
    },
    "isGuest": true
  },
  "error": null
}
```

---

## 🔐 Authenticated User Listing Conversations

### Request

```http
GET /api/conversations
Authorization: Bearer {access_token}
```


### Response (200 OK)

```json
{
  "success": true,
  "message": "Conversations retrieved successfully",
  "data": [
    {
      "id": "conv_123",
      "title": "Project Discussion",
      "status": "active",
      "created_at": "2026-01-14T10:00:00.000Z",
      "updated_at": "2026-01-14T10:30:00.000Z",
      "last_message": "Great, let's proceed with that plan.",
      "last_message_role": "assistant",
      "message_count": 15
    },
    {
      "id": "conv_456",
      "title": "Bug Report",
      "status": "closed",
      "created_at": "2026-01-13T09:00:00.000Z",
      "updated_at": "2026-01-13T09:30:00.000Z",
      "last_message": "Issue has been resolved.",
      "last_message_role": "assistant",
      "message_count": 8
    }
  ],
  "pagination": {
    "total": 25
  },
  "is_guest": false,
  "error": null
}
```

---

## 🔒 Closing a Conversation

### Request

```http
POST /api/conversations/conv_123/close
Authorization: Bearer {access_token}
```


### Response (200 OK)

```json
{
  "success": true,
  "message": "Conversation closed successfully",
  "data": null,
  "error": null
}
```

---

## ✏️ Updating Conversation Title

### Request

```http
PATCH /api/conversations/conv_789/title
Content-Type: application/json
```

```json
{
  "title": "Updated Guest Support Chat",
  "session_id": "guest-session-123"
}
```


### Response (200 OK)

```json
{
  "success": true,
  "message": "Title updated successfully",
  "data": {
    "id": "conv_789",
    "title": "Updated Guest Support Chat",
    "status": "active",
    "created_at": "2026-01-14T11:00:00.000Z",
    "updated_at": "2026-01-14T11:05:00.000Z"
  },
  "is_guest": true,
  "error": null
}
```

---

# ❌ Error Handling

## Error Response Format

```typescript
interface ErrorResponse {
  success: false;
  message: string;
  data: null;
  error: string;
}
```

## Common Error Examples


### Missing Session ID (400)

```json
{
  "success": false,
  "message": "session_id is required for guest users",
  "data": null,
  "error": "Session ID required"
}
```


### Conversation Not Found (404)

```json
{
  "success": false,
  "message": "Conversation not found",
  "data": null,
  "error": "Conversation with ID conv_123 not found"
}
```


### Missing Title (400)

```json
{
  "success": false,
  "message": "Title is required",
  "data": null,
  "error": "Missing title parameter"
}
```


## 📊 HTTP Status Codes

| Code | Description | When Used |
|:---|:---|:---|
| 200 | Success | Request completed successfully |
| 201 | Created | Conversation successfully created |
| 400 | Bad Request | Invalid parameters or missing fields |
| 401 | Unauthorized | Invalid or missing authentication |
| 404 | Not Found | Conversation does not exist |
| 500 | Internal Server Error | Server-side issues |

## 💾 Storage Strategies

The Conversation Management API supports flexible storage strategies using **PostgreSQL** for persistent data and **Redis** for fast temporary storage.

---

## 🗄️ Database Storage (PostgreSQL)

### Use Case

Persistent and reliable conversation storage.

### Advantages

- Full data integrity
- Relational data support
- Powerful querying capabilities
- Long-term data persistence

### Best For

- Production conversations
- Authenticated user data
- Message history storage


### Example

```typescript
const conversation = await prisma.conversation.create({
  data: {
    userId: user.id,
    title: "My Chat",
    status: "active"
  }
});
```

---

## ⚡ Redis Storage

### Use Case

Fast and temporary conversation storage.

### Advantages

- High performance
- Low latency access
- Built-in TTL support
- Suitable for temporary sessions

### Best For

- Guest conversations
- Temporary chat sessions
- Cache layer


### Example

```typescript
const conversation = await redisClient.hSet(
  `conversation:${id}`,
  {
    title: "Guest Chat",
    status: "active",
    createdAt: new Date().toISOString()
  }
);
```

---

## 🔄 Storage Selection

| User Type | Default Storage | Alternative |
|:---|:---|:---|
| 👤 Authenticated User | PostgreSQL | Redis cache |
| 👥 Guest User | Redis | PostgreSQL (optional) |

---

## 📌 Storage Flow

```
User Request
      |
      v
Conversation API
      |
      +----------------+
      |                |
Authenticated      Guest User
      |                |
      v                v
PostgreSQL          Redis
(Persistent)        (Temporary)
```

## 🔧 Implementation Notes

## 👥 Guest User Flow

Guest users can create and manage conversations without authentication using session-based identification.

### Flow

1. Client generates a unique `session_id` (UUID recommended)
2. All guest requests include `session_id` in request body or query parameters
3. Conversations are stored using Redis or PostgreSQL based on configuration
4. Guest conversations can be migrated to a registered user account after signup


---

## 🔐 Authentication Middleware

The `authOptional` middleware supports both guest and authenticated requests.

### Behavior

- Detects whether the request belongs to an authenticated user or guest
- Automatically identifies the user type
- Sets `req.user` for authenticated users
- Sets `req.isGuest` flag for guest users
- Allows public conversation operations with optional authentication


---

## ✅ Best Practices

| Practice | Description |
|:---|:---|
| 🔒 Ownership Validation | Always verify conversation ownership for guest sessions |
| ⏳ TTL Management | Apply expiration policy for guest conversations (recommended: 30 days) |
| ⚡ Caching | Cache frequently accessed conversations for faster response |
| 📄 Pagination | Use pagination for large conversation histories |
| 🗑️ Soft Delete | Prefer soft delete to allow data recovery |


---

<div align="center">

** Made with ❤️ by Karthikeya **

[⬆ Back to Top](#-conversation-management-api)

</div>
