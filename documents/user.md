# 👥 User Management API

<div align="center">

## Complete User Management Module

A comprehensive **User Management System** providing CRUD operations, profile management, and administrative controls with pagination, filtering, and search capabilities.

<br/>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-18.x-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Express-4.x-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express.js" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/PostgreSQL-15-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />

  <img src="https://img.shields.io/badge/Swagger-OpenAPI-85EA2D?style=for-the-badge&logo=swagger&logoColor=black" alt="Swagger" />
</p>

<p align="center">
  <strong>User Profiles</strong> •
  <strong>Pagination & Filtering</strong> •
  <strong>Role Management</strong> •
  <strong>Search Functionality</strong> •
  <strong>User Administration</strong>
</p>

---

</div>

## 📋 Table of Contents

<div align="center">

| Section | About |
|:---|:---|
| [Overview](#overview) | Introduction to user management |
| [Features](#features) | Core user management capabilities |
| [Tech Stack](#tech-stack) | Technologies used |
| [API Reference](#api-reference) | Available endpoints |
| [Request Examples](#request--response-examples) | API usage examples |
| [Error Handling](#error-handling) | Error responses and status codes |
| [Security](#security) | Access control and security features |

</div>

## 📌 Overview

The **User Management API** provides comprehensive user administration capabilities including profile retrieval, user listing with advanced filtering, pagination, search functionality, and user management operations.

Built with **Express.js**, **TypeScript**, and **Prisma ORM**, it provides a robust, scalable, and type-safe solution for managing users in modern applications.

## ✨ Key Highlights

<div align="center">

| Feature | Description |
|:---|:---|
| 🔍 Profile Retrieval | Retrieve user profiles by ID or email |
| 📊 Paginated Listings | Efficient user listing with pagination support |
| 🔎 Advanced Filtering | Filter users by role, status, and search terms |
| 🛡️ Role Management | Manage user and admin roles |
| 🗑️ User Deletion | Secure user account removal |
| 📚 Swagger Documentation | Interactive API documentation |
| 🔒 Protected Routes | Authentication required for user operations |

</div>

## ✨ Features

### 👤 User Profile Management

<div align="center">

| Feature | Description |
|:---|:---|
| ✅ Get User by ID | Retrieve complete user profile using user UUID |
| ✅ Get User by Email | Lookup users using email address |
| ✅ Profile Details | Access user email, role, status, and timestamps |
| ✅ User Deletion | Securely remove user accounts |

</div>


### 📊 User Listing & Search

<div align="center">

| Feature | Description |
|:---|:---|
| ✅ Pagination | Efficient data loading using page and limit parameters |
| ✅ Role Filtering | Filter users by user or admin roles |
| ✅ Active Status | Filter users by active or inactive status |
| ✅ Search Functionality | Search users by email or user ID |
| ✅ Sorting | Ordered results based on creation date |

</div>


### 🛡️ Security & Access Control

<div align="center">

| Feature | Description |
|:---|:---|
| ✅ Authentication Required | All user endpoints require authentication |
| ✅ Role-Based Access | Restrict sensitive operations to authorized users |
| ✅ Input Validation | Validate request parameters before processing |
| ✅ Error Handling | Provide consistent API error responses |

</div>

## 📖 API Reference

### 👤 User Profile Endpoints

| Method | Endpoint | Description | Auth |
|:---|:---|:---|:---|
| GET | `/api/users/:userId` | Get user profile by ID | ✅ |
| GET | `/api/users/by-email` | Get user profile by email | ✅ |
| GET | `/api/users` | Get all users with filters | ✅ |
| DELETE | `/api/users/:userId` | Delete user by ID | ✅ |


## 📋 Endpoint Details

### 🔍 Get User by ID

```http
GET /api/users/{userId}
```

### Path Parameters

| Parameter | Type | Required | Description |
|:---|:---|:---|:---|
| userId | string | ✅ | UUID of the user |


### Response (200 OK)

```json
{
  "message": "User profile retrieved successfully",
  "data": {
    "id": "019ec533-217f-7396-8d14-ec8f632ca8a7",
    "email": "user@example.com",
    "role": "user",
    "is_active": true,
    "created_at": "2026-01-14T10:00:00.000Z",
    "updated_at": "2026-01-14T10:00:00.000Z"
  },
  "error": null
}
```


---

## 📧 Get User by Email

```http
GET /api/users/by-email?email={email}
```

### Query Parameters

| Parameter | Type | Required | Description |
|:---|:---|:---|:---|
| email | string | ✅ | User email address |


### Response (200 OK)

Same response format as **Get User by ID**.


---

## 📊 List All Users

```http
GET /api/users?page=1&limit=10&role=user&search=test&is_active=true
```

### Query Parameters

| Parameter | Type | Required | Description | Default |
|:---|:---|:---|:---|:---|
| page | integer | ❌ | Page number | 1 |
| limit | integer | ❌ | Items per page (1-100) | 10 |
| role | string | ❌ | Filter by role (`user/admin`) | - |
| search | string | ❌ | Search by email or ID | - |
| is_active | boolean | ❌ | Filter by active status | - |


### Response (200 OK)

```json
{
  "message": "Users retrieved successfully",
  "data": [
    {
      "id": "019ec533-217f-7396-8d14-ec8f632ca8a7",
      "email": "user1@example.com",
      "role": "user",
      "is_active": true,
      "created_at": "2026-01-14T10:00:00.000Z",
      "updated_at": "2026-01-14T10:00:00.000Z"
    },
    {
      "id": "019ec534-318g-8407-9e25-fd9g743db9b8",
      "email": "user2@example.com",
      "role": "admin",
      "is_active": true,
      "created_at": "2026-01-13T09:00:00.000Z",
      "updated_at": "2026-01-13T09:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "totalPages": 3
  },
  "error": null
}
```


---

## 🗑️ Delete User

```http
DELETE /api/users/{userId}
```

### Path Parameters

| Parameter | Type | Required | Description |
|:---|:---|:---|:---|
| userId | string | ✅ | UUID of the user to delete |


### Response (200 OK)

```json
{
  "message": "User deleted successfully",
  "data": null,
  "error": null
}
```

## 📤 Request & Response Examples

### 🔍 Get User Profile (Success)

### Request

```http
GET /api/users/019ec533-217f-7396-8d14-ec8f632ca8a7
Authorization: Bearer {access_token}
```

### Response (200 OK)

```json
{
  "message": "User profile retrieved successfully",
  "data": {
    "id": "019ec533-217f-7396-8d14-ec8f632ca8a7",
    "email": "john.doe@example.com",
    "role": "user",
    "is_active": true,
    "created_at": "2026-01-14T10:00:00.000Z",
    "updated_at": "2026-01-14T10:00:00.000Z"
  },
  "error": null
}
```


---

## 📧 Get User by Email (Success)

### Request

```http
GET /api/users/by-email?email=john.doe@example.com
Authorization: Bearer {access_token}
```

### Response (200 OK)

```json
{
  "message": "User profile retrieved successfully",
  "data": {
    "id": "019ec533-217f-7396-8d14-ec8f632ca8a7",
    "email": "john.doe@example.com",
    "role": "user",
    "is_active": true
  },
  "error": null
}
```


---

## 📊 List Users with Filters

### Request

```http
GET /api/users?page=2&limit=5&role=admin&is_active=true&search=admin
Authorization: Bearer {access_token}
```

### Response (200 OK)

```json
{
  "message": "Users retrieved successfully",
  "data": [
    {
      "id": "019ec534-318g-8407-9e25-fd9g743db9b8",
      "email": "admin1@example.com",
      "role": "admin",
      "is_active": true,
      "created_at": "2026-01-13T09:00:00.000Z",
      "updated_at": "2026-01-13T09:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 3,
    "page": 2,
    "limit": 5,
    "totalPages": 1
  },
  "error": null
}
```


---

## 🗑️ Delete User (Success)

### Request

```http
DELETE /api/users/019ec533-217f-7396-8d14-ec8f632ca8a7
Authorization: Bearer {access_token}
```

### Response (200 OK)

```json
{
  "message": "User deleted successfully",
  "data": null,
  "error": null
}
```

---

# ❌ Error Handling

## Error Response Format

```typescript
interface ErrorResponse {
  message: string;
  data: null;
  error: string;
}
```

## Common Error Examples


### Missing User ID (400)

```json
{
  "message": "User ID is required",
  "data": null,
  "error": "Missing userId parameter"
}
```


### User Not Found (404)

```json
{
  "message": "User not found",
  "data": null,
  "error": "User does not exist"
}
```


### Missing Email (400)

```json
{
  "message": "Email is required",
  "data": null,
  "error": "Missing email parameter"
}
```


### Invalid Parameters (400)

```json
{
  "message": "Invalid parameters",
  "data": null,
  "error": "Page must be a positive integer"
}
```


### Unauthorized (401)

```json
{
  "message": "Unauthorized",
  "data": null,
  "error": "Invalid or missing authentication token"
}
```


## 📊 HTTP Status Codes

| Code | Description | When Used |
|:---|:---|:---|
| 200 | Success | Request completed successfully |
| 400 | Bad Request | Invalid parameters or missing fields |
| 401 | Unauthorized | Invalid or missing authentication |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | User does not exist |
| 500 | Internal Server Error | Server-side issues |

## 🛡️ Security

### 🔐 Authentication Requirements

All user management endpoints require authentication using a **Bearer access token**.

```http
Authorization: Bearer {access_token}
```


### 🔑 Access Control

| Endpoint | Required Role | Description |
|:---|:---|:---|
| `GET /users/:userId` | User / Admin | View user profile (admin can view any profile) |
| `GET /users/by-email` | User / Admin | Lookup user by email |
| `GET /users` | Admin | Retrieve all users |
| `DELETE /users/:userId` | Admin | Delete user account |


### 🔒 Data Privacy

- Users can only access their own profile unless they have admin privileges
- Passwords and sensitive credentials are never exposed through APIs
- Administrative actions can be tracked through activity logs


---

## 📊 Data Model

```prisma
model User {
  id            String   @id @default(uuid())
  email         String   @unique
  password      String
  role          String   @default("user")
  is_active     Boolean  @default(true)
  created_at    DateTime @default(now())
  updated_at    DateTime @updatedAt

  sessions      Session[]
  conversations Conversation[]
}
```


---

## 🔧 Implementation Notes

### 📄 Pagination

- Default page: `1`
- Default limit: `10`
- Maximum limit: `100`
- Total pages calculated automatically from total records


### 🔍 Filtering

Supported filters:

| Filter | Description |
|:---|:---|
| Role | Filter users by `user` or `admin` |
| Status | Filter active (`true`) or inactive (`false`) users |
| Search | Case-insensitive search by email or user ID |


### ↕️ Sorting

- Default sorting: `created_at DESC`
- Sorting can be extended with additional fields if required


---

<div align="center">

**Made with ❤️ by Karthikeya**

[⬆ Back to Top](#-user-management-api)

</div>
