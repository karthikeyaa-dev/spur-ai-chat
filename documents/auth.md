# 🔐 Authentication & Session Management API

<div align="center">

### Secure • Scalable • Production Ready

A production-ready **Authentication & Session Management API** built with **Node.js**, **Express.js**, **TypeScript**, **JWT**, **PostgreSQL**, and **Redis**. Designed with modern security practices, scalable architecture, and comprehensive API documentation.

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-18.x-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Express-4.x-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express.js" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/JWT-Authentication-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white" alt="JWT" />
  <img src="https://img.shields.io/badge/PostgreSQL-15-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Redis-7-DC382D?style=for-the-badge&logo=redis&logoColor=white" alt="Redis" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Swagger-OpenAPI-85EA2D?style=for-the-badge&logo=swagger&logoColor=black" alt="Swagger" />
  <img src="https://img.shields.io/badge/License-MIT-1F9A9F?style=for-the-badge" alt="MIT License" />
</p>

<p align="center">
  <strong>JWT Authentication</strong> •
  <strong>Role-Based Authorization</strong> •
  <strong>Session Management</strong> •
  <strong>Refresh Tokens</strong> •
  <strong>Redis Caching</strong> •
  <strong>REST API</strong>
</p>

---

</div>

## 📋 Table of Contents


<div align="center">

| Section | About |
|:---|:---|
| [Overview](#overview) | Introduction and project summary |
| [Features](#features) | Core authentication and session features |
| [Tech Stack](#tech-stack) | Technologies and frameworks used |
| [Architecture](#architecture) | System design and application flow |
| [Project Structure](#project-structure) | Folder organization and code structure |
| [Installation](#installation) | Setup and dependency installation steps |
| [Environment Variables](#environment-variables) | Required configuration settings |
| [Running the Project](#running-the-project) | Development and production execution |
| [API Documentation](#api-documentation) | Swagger and API usage guide |
| [Authentication Flow](#authentication-flow) | Login, token, and authorization flow |
| [Session Management](#session-management) | Session handling and token lifecycle |
| [Email Verification Flow](#email-verification-flow) | User email verification process |
| [Password Reset Flow](#password-reset-flow) | Secure password recovery process |
| [OAuth Flow](#oauth-flow) | Third-party authentication integration |
| [API Reference](#api-reference) | Available API endpoints |
| [Error Handling](#error-handling) | Error responses and handling strategy |
| [Security Features](#security-features) | Security practices and protections |
| [Scripts](#scripts) | Available npm commands |
| [Deployment](#deployment) | Production deployment guide |
| [Contributing](#contributing) | Contribution guidelines |
| [License](#license) | Project license information |

</div>

## 📌 Overview

The **Authentication & Session Management API** is a secure, scalable, and production-ready authentication system designed for modern web applications.

Built with **Express.js** and **TypeScript**, this API follows industry-standard security practices and provides a complete authentication workflow including **JWT authentication**, **refresh token rotation**, **session management**, **email verification**, **password recovery**, and **OAuth authentication** with providers like Google and GitHub.

### ✨ Key Highlights

<div align="center">

| Feature | Description |
|:---|:---|
| ✅ Production Ready | Secure, tested, and optimized for real-world applications |
| 🔷 Type Safe | Built with TypeScript for reliable and maintainable code |
| 🌐 RESTful API | Clean and scalable API architecture |
| 📚 Swagger Documentation | Interactive and comprehensive API documentation |
| 📱 Multi-Device Sessions | Manage user sessions across multiple devices |
| 🔐 JWT Authentication | Secure access and refresh token-based authentication |
| 🔄 Token Rotation | Enhanced security with refresh token lifecycle management |
| 🌍 OAuth Integration | Social login support with Google and GitHub |
| ⚡ Redis Support | Fast session storage and scalable caching |
| 🛡️ Security First | Implements modern authentication and protection practices |

</div>

## ✨ Features

### 🔐 Core Authentication

<div align="center">

| Feature | Description |
|:---|:---|
| ✅ User Registration | Create accounts using email and password |
| ✅ Secure Login | JWT-based authentication system |
| ✅ Refresh Token Rotation | Enhanced security with rotating refresh tokens |
| ✅ Password Hashing | Secure password storage using bcrypt (10 rounds) |
| ✅ Bearer Token Authorization | Protected API access using access tokens |

</div>

### 📱 Session Management

<div align="center">

| Feature | Description |
|:---|:---|
| ✅ Active Session Tracking | Track IP address, user-agent, and timestamps |
| ✅ Session Revocation | Revoke individual user sessions |
| ✅ Bulk Session Logout | Remove multiple sessions while keeping current session active |
| ✅ Current Session Logout | Logout from the active device |
| ✅ Session Expiration | Configurable session TTL management |
</div>

### 📧 Email Services

<div align="center">

| Feature | Description |
|:---|:---|
| ✅ Email Verification | Verify user accounts after registration |
| ✅ Resend Verification Email | Send verification links again |
| ✅ Verification Status | Check account verification state |
| ✅ Forgot Password | Request password reset through email |
| ✅ Password Reset | Secure password recovery workflow |
| ✅ Reset Token Validation | Validate password reset tokens securely |

</div>

### 🌐 OAuth Integration

<div align="center">

| Feature | Description |
|:---|:---|
| ✅ Google OAuth 2.0 | Login using Google account |
| ✅ GitHub OAuth | Login using GitHub account |
| ✅ Account Linking | Connect OAuth providers to existing accounts |
| ✅ Provider Disconnect | Remove connected OAuth accounts |
| ✅ Connected Accounts | View linked social accounts |

</div>


### 🛡️ Security Features

<div align="center">

| Feature | Description |
|:---|:---|
| ✅ Rate Limiting | Protect APIs with request limits |
| ✅ CORS Configuration | Secure cross-origin access |
| ✅ Helmet.js | Secure HTTP headers |
| ✅ Input Validation | Validate all incoming requests |
| ✅ Password Policy | Minimum 8 character password requirement |
| ✅ Token Blacklisting | Revoke invalid refresh tokens |

</div>

### 🧑‍💻 Developer Experience

<div align="center">

| Feature | Description |
|:---|:---|
| ✅ Swagger Documentation | Interactive OpenAPI documentation |
| ✅ TypeScript Support | Type-safe and maintainable development |
| ✅ Standard API Responses | Consistent response format |
| ✅ Error Handling | Centralized error management |
| ✅ Environment Configuration | Flexible environment-based setup |

</div>

## 🔐 Authentication Flow

The authentication process uses **JWT access tokens**, **refresh tokens**, and secure session management.

```mermaid
sequenceDiagram
    participant User
    participant Client
    participant API
    participant Database

    User->>Client: Register/Login
    Client->>API: POST /auth/register or /auth/login

    alt Registration
        API->>API: Validate email & password
        API->>Database: Create user
        API->>API: Generate verification token
        API->>User: Send verification email
        API-->>Client: 201 Created
    end

    alt Login
        API->>Database: Verify credentials
        API->>API: Generate access + refresh tokens
        API->>Database: Store session
        API-->>Client: 200 OK with tokens
    end

    Client->>API: Protected request (Bearer Token)
    API->>API: Validate access token
    API-->>Client: 200 OK (Protected data)

    alt Access Token Expired
        Client->>API: POST /auth/refresh
        API->>API: Validate refresh token
        API->>API: Generate new token pair
        API-->>Client: New access + refresh tokens
    end
```

## 🔑 Token Lifecycle

Token management is designed with short-lived access tokens and secure long-lived refresh tokens to improve security.

| Token Type | Expiry | Purpose | Storage |
|:---|:---|:---|:---|
| 🔐 Access Token | 15 minutes | Authorize API requests | Client memory |
| 🔄 Refresh Token | 7 days | Generate new access tokens | HTTP-only cookie or secure storage |
| 📧 Verification Token | 24 hours | Verify user email address | Database (hashed) |
| 🔑 Reset Token | 1 hour | Secure password reset process | Database (hashed) |

## 👥 Session Management

The session management system provides secure multi-device tracking, session control, and token lifecycle management.

### 🔄 Session Lifecycle

```mermaid
graph LR
    Login[User Login] --> Create[Create Session]
    Create --> Store[Store in Database]
    Store --> Track[Track Activity]
    Track --> Active[Active Session]
    Active --> Expire[Expire / Terminate]
    Expire --> Revoke[Revoke Session]
```

### 📦 Session Data Structure

```typescript
interface Session {
  id: string;
  user_id: string;
  ip_address: string;
  user_agent: string;
  refresh_token_hash: string;
  created_at: Date;
  last_activity: Date;
  expires_at: Date;
  is_revoked: boolean;
}
```

### ⚙️ Session Operations

| Operation | Endpoint | Description |
|:---|:---|:---|
| 📋 Get Sessions | `GET /api/auth/sessions` | Retrieve all active user sessions |
| 🚫 Revoke One Session | `DELETE /api/auth/sessions/:id` | Terminate a specific session |
| 🛑 Revoke All Sessions | `DELETE /api/auth/sessions` | Terminate all active sessions |
| 🚪 Logout | `POST /api/auth/logout` | End the current active session |

## 📧 Email Verification Flow

The email verification system ensures that users confirm ownership of their email address before accessing protected features.

### 🔄 Verification Process

```mermaid
sequenceDiagram
    participant User
    participant API
    participant Email

    User->>API: Register Account
    API->>API: Create user account
    API->>Email: Send verification email
    Email-->>User: Verification link received
    User->>API: GET /auth/verify-email?token=xxx
    API->>API: Validate verification token
    API->>API: Mark email as verified
    API-->>User: Verification successful
```

### 📌 Verification Endpoints

| Method | Endpoint | Description |
|:---|:---|:---|
| GET | `/api/auth/verify-email` | Verify email address using token |
| POST | `/api/auth/verify-email/resend` | Resend verification email |
| GET | `/api/auth/email-verified` | Check email verification status |

## 🔑 Password Reset Flow

The password reset system provides a secure recovery process using time-limited reset tokens and email verification.

### 🔄 Reset Process

```mermaid
sequenceDiagram
    participant User
    participant API
    participant Email

    User->>API: POST /auth/forgot-password
    API->>API: Generate reset token
    API->>Email: Send password reset email
    Email-->>User: Reset link received

    User->>API: GET /auth/validate-reset-token?token=xxx
    API->>API: Validate reset token
    API-->>User: Token is valid

    User->>API: POST /auth/reset-password
    API->>API: Validate token & new password
    API->>API: Update password
    API-->>User: Password reset successful
```

### 📌 Password Reset Endpoints

| Method | Endpoint | Description |
|:---|:---|:---|
| POST | `/api/auth/forgot-password` | Request password reset email |
| GET | `/api/auth/validate-reset-token` | Validate password reset token |
| POST | `/api/auth/reset-password` | Update password with valid token |

## 🌐 OAuth Flow

The OAuth integration allows users to authenticate using third-party providers such as **Google** and **GitHub** while securely linking accounts.

### 🔄 OAuth Authentication Process

```mermaid
sequenceDiagram
    participant User
    participant Client
    participant API
    participant Provider as OAuth Provider
    participant Database

    User->>Client: Click "Login with Google"
    Client->>API: GET /auth/google
    API->>Provider: Redirect to OAuth provider
    Provider-->>User: Login consent screen
    User->>Provider: Authenticate & approve

    Provider-->>API: Redirect with authorization code
    API->>Provider: Exchange code for access token
    API->>Provider: Fetch user profile
    API->>Database: Find or create user
    API->>API: Generate JWT tokens
    API->>Client: Return authentication response
    Client-->>User: Authentication complete
```

### 📌 OAuth Endpoints

| Method | Endpoint | Description |
|:---|:---|:---|
| GET | `/api/auth/google` | Start Google OAuth authentication |
| GET | `/api/auth/google/callback` | Handle Google OAuth callback |
| GET | `/api/auth/github` | Start GitHub OAuth authentication |
| GET | `/api/auth/github/callback` | Handle GitHub OAuth callback |
| GET | `/api/auth/oauth/accounts` | Get connected OAuth accounts |
| DELETE | `/api/auth/oauth/:provider` | Disconnect OAuth provider |

<div align="center">

Made with ❤️ by Karthikeya

⬆ Back to Top
</div>

