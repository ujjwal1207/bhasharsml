# JWT Authentication API Documentation

## Overview
This application now includes JWT-based authentication with role-based access control (admin and user roles) and admin approval workflow.

## Authentication Flow
1. Users register with name, email, and password
2. Admin approves the user account
3. User can then login and receive a JWT token
4. Token must be included in all protected API requests

## API Endpoints

### Public Endpoints (No Authentication Required)

#### 1. Register New User
**POST** `/api/auth/register`

Register a new user account (requires admin approval before login).

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful. Your account is pending admin approval.",
  "data": {
    "user": {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "isApproved": false
    }
  }
}
```

---

#### 2. Login
**POST** `/api/auth/login`

Login with email and password (only approved users can login).

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "jwt_token_here",
    "user": {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "isApproved": true
    }
  }
}
```

---

#### 3. Initialize Admin (First Time Only)
**POST** `/api/auth/init-admin`

Create the first admin user. This endpoint only works when no users exist in the database.

**Request Body:**
```json
{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Admin user created successfully",
  "data": {
    "token": "jwt_token_here",
    "user": {
      "_id": "admin_id",
      "name": "Admin User",
      "email": "admin@example.com",
      "role": "admin",
      "isApproved": true
    }
  }
}
```

---

### Protected Endpoints (Authentication Required)

**Note:** Include the JWT token in the Authorization header for all protected endpoints:
```
Authorization: Bearer your_jwt_token_here
```

#### 4. Get Current User Profile
**GET** `/api/auth/me`

Get the profile of the currently logged-in user.

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "isApproved": true,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

---

### Admin Only Endpoints (Admin Role Required)

#### 5. Get All Users
**GET** `/api/auth/users`

Get all users. Optionally filter by approval status.

**Query Parameters:**
- `status` (optional): `pending` or `approved`

**Examples:**
- Get all users: `/api/auth/users`
- Get pending users: `/api/auth/users?status=pending`
- Get approved users: `/api/auth/users?status=approved`

**Response:**
```json
{
  "success": true,
  "count": 2,
  "data": {
    "users": [
      {
        "_id": "user_id",
        "name": "John Doe",
        "email": "john@example.com",
        "role": "user",
        "isApproved": false,
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

---

#### 6. Approve User
**PUT** `/api/auth/users/:id/approve`

Approve a pending user account.

**Response:**
```json
{
  "success": true,
  "message": "User approved successfully",
  "data": {
    "user": {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "isApproved": true,
      "approvedAt": "2024-01-02T00:00:00.000Z"
    }
  }
}
```

---

#### 7. Reject/Revoke User Approval
**PUT** `/api/auth/users/:id/reject`

Revoke approval from a user account.

**Response:**
```json
{
  "success": true,
  "message": "User approval revoked successfully",
  "data": {
    "user": {
      "_id": "user_id",
      "name": "John Doe",
      "isApproved": false
    }
  }
}
```

---

#### 8. Delete User
**DELETE** `/api/auth/users/:id`

Delete a user account (admins cannot delete themselves).

**Response:**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

---

## Voice API Endpoints (Now Protected)

All existing voice API endpoints now require authentication. Include the JWT token in the Authorization header.

- **GET** `/api/batches` - Get maximum batch number
- **GET** `/api/batch/:batch_id/files` - Get maximum file number for a batch
- **GET** `/api/batch/:batch_id/file/:file_number` - Get all segments
- **POST** `/api/batch/:batch_id/file/:file_number/save` - Save RSML data

---

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory:

```env
PORT=3000
MONGO_URI=mongodb+srv://username:password@cluster-url/bhasha_check?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d
NODE_ENV=development
```

**MongoDB Atlas Setup:**
1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Create database user with password
4. Get connection string and replace in MONGO_URI
5. Whitelist your IP address

**Generate JWT Secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Start the Server
```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

---

## Quick Start Guide

### Step 1: Create Admin User
First time setup - create an admin user:

```bash
curl -X POST http://localhost:3000/api/auth/init-admin \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin",
    "email": "admin@example.com",
    "password": "admin123"
  }'
```

Save the returned token.

### Step 2: Register a Regular User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Step 3: Admin Approves User
Get pending users (as admin):
```bash
curl http://localhost:3000/api/auth/users?status=pending \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

Approve the user (replace USER_ID):
```bash
curl -X PUT http://localhost:3000/api/auth/users/USER_ID/approve \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

### Step 4: User Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

Save the returned token for API requests.

### Step 5: Access Protected API
```bash
curl http://localhost:3000/api/batches \
  -H "Authorization: Bearer USER_TOKEN"
```

---

## Error Responses

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Not authorized, no token provided"
}
```

### 403 Forbidden (Not Approved)
```json
{
  "success": false,
  "message": "Your account is pending approval from an administrator"
}
```

### 403 Forbidden (Not Admin)
```json
{
  "success": false,
  "message": "Access denied. Admin privileges required."
}
```

---

## Security Features

1. **Password Hashing**: Passwords are hashed using bcrypt
2. **JWT Tokens**: Secure token-based authentication
3. **Role-Based Access**: Admin and user roles with different permissions
4. **Approval Workflow**: Users must be approved by admin before accessing the system
5. **Protected Routes**: All voice API endpoints require authentication
6. **Token Expiration**: Tokens expire after configured time (default 7 days)

---

## User Roles

### Admin
- Approve/reject user accounts
- View all users
- Delete users
- Access all protected endpoints

### User
- Access protected voice API endpoints after approval
- View own profile
- Cannot access admin endpoints

---

## Notes

- First user must be created using `/api/auth/init-admin` endpoint
- Users cannot login until approved by an admin
- JWT tokens should be stored securely on the client side
- Use HTTPS in production
- Change JWT_SECRET in production to a strong random string
