# BhashaCheck - MERN Stack Application

A full-stack MERN (MongoDB, Express, React, Node.js) application for voice data annotation with RSML (Rich Speech Markup Language) support, featuring JWT authentication and role-based access control.

## 🚀 Features

### Backend (Express + MongoDB)
- RESTful API for voice data management
- JWT-based authentication with secure token management
- Role-based access control (Admin & User roles)
- User approval workflow system
- MongoDB integration with Mongoose ODM
- CORS enabled for cross-origin requests
- Compression middleware for optimized responses
- Static file serving for audio files

### Frontend (React + Vite)
- Interactive RSML annotation interface
- Real-time preview with syntax highlighting
- Admin dashboard for user management
- User dashboard with conditional access
- Protected routes with authentication
- Audio playback integration
- Batch and file navigation
- Fast development with Vite HMR

## 📁 Project Structure

```
bhasharsml/
├── client/                          # React + Vite Frontend
│   ├── src/
│   │   ├── components/
│   │   │   └── PrivateRoute.jsx    # Protected route wrapper
│   │   ├── context/
│   │   │   └── AuthContext.jsx     # Authentication context
│   │   ├── pages/
│   │   │   ├── Login.jsx           # Login page
│   │   │   ├── Register.jsx        # Registration page
│   │   │   ├── AdminDashboard.jsx  # Admin panel
│   │   │   ├── UserDashboard.jsx   # User dashboard
│   │   │   └── RSMLAnnotation.jsx  # Annotation interface
│   │   ├── services/
│   │   │   └── authService.js      # API service layer
│   │   ├── App.jsx                 # Main app component
│   │   └── main.jsx                # App entry point
│   ├── vite.config.js              # Vite configuration
│   ├── package.json                # Frontend dependencies
│   └── .env                        # Frontend environment variables
### Prerequisites
- **Node.js** (v16 or higher)
- **MongoDB** (local or MongoDB Atlas)
- **npm** or **yarn**

### 1. Clone the Repository
```bash
cd d:\BoloAuth\bhasharsml
```

### 2. Install Backend Dependencies
```bash
npm install
```

### 3. Install Frontend Dependencies
```bash
cd client
npm install
cd ..
```

### 4. Configure Environment Variables

#### Backend `.env` (root directory)
```env
# MongoDB connection
MONGO_URI=mongodb://localhost:27017/bhasha_check

# JWT Secret (use a strong random string)
JWT_SECRET=your_super_secret_jwt_key_here

# Server port
PORT=3000

# Environment
NODE_ENV=development
```

#### Frontend `.env` (client directory)
```env
# Vite port
VITE_PORT=3001

# API URL
VITE_API_URL=http://localhost:3000/api                # CSV to MongoDB import
├── data/
│   └── audio/                      # Audio files directory
├── .env                            # Server environment variables
├── package.json                    # Backend dependencies
└── server.js                       # Express server entry point
```

## 🛠️ Installation

1. **Install Node.Application

### Development Mode

You need to run both backend and frontend servers:

#### Terminal 1 - Backend Server
```bash
npm run dev
# Server runs on http://localhost:3000
```

#### Terminal 2 - Frontend Server
```bash
cd client
npm run dev
# FrAuthentication Endpoints (`/api/auth`)

#### 1. Register User (Public)
```
POST /api/auth/register
```
**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### 2. Login (Public)
```
POST /api/auth/login
```
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
  "data": {
    "token": "jwt_token_here",
    "user": {
      "_id": "user_id",
Headers: Authorization: Bearer <token>
```
**Response:**
```json
{
  "max_batch": 10
}
```

#### 2. Get Maximum File Number for a Batch
```
GET /api/batch/:batch_id/files
Headers: Authorization: Bearer <token>
GET /api/auth/me
Headers: Authorization: Bearer <token>
```

#### 4. Get All Users (Admin Only)
```
GET /api/auth/users?status=pending
Headers: Authorization: Bearer <token>
```# 3. Get All Segments for a Batch and File
```
GET /api/batch/:batch_id/file/:file_number
Headers: Authorization: Bearer <token>
```
PUT /api/auth/users/:id/approve
Headers: Authorization: Bearer <token>
```

#### 6. Reject User (Admin Only)
```
PUT /api/auth/users/:id/reject
Headers: Authorization: Bearer <token>
```

#### 7. Delete User (Admin Only)
```
DELETE /api/auth/users/:id
Headers: Authorization: Bearer <token>
```

### Voice Data Endpoints (`/api`)

All voice endpoints require authentication (JWT token in Authorization header).

#### ontend runs on http://localhost:3001
```

### Production Mode

#### Build Frontend
```bash
cd client
npm run build
cd ..
```

#### Start Server
```bash
npm start
# Server serves built React app from client/build
```

## 👤 Initial Setup

### Create Admin Account

Use the init-admin endpoint (only works if no users exist):

**Using PowerShell:**
```powershell
$body = @{
    name = "Admin User"
    email = "admin@example.com"
    password = "admin123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/auth/init-admin" `
    -Method Post -Body $body -ContentType "application/json"
```

**Using cURL:**
```bash
curl -X POST http://localhost:3000/api/auth/init-admin \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin User","email":"admin@example.com","password":"admin123"}'
``k
POR# 4. Save RSML Data
```
POST /api/batch/:batch_id/file/:file_number/save
Headers: Authorization: Bearer <token>

## 📊 Importing CSV Data

To import data from `indicvoices_rsml_ready.csv` into MongoDB:

```bash
npm run import
```

This will:
- Connect to MongoDB
- Clear existing data
- Import all CSV records
- Create necessary indexes

## 🚀 Running the Server

**Development mode (with auto-restart):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
`` 🎨 Frontend Pages

- **`/login`** - Login page (public)
- **`/register`** - Registration page (public)
- **`/dashboard`** - User dashboard (protected)
- **`/admin/dashboard`** - Admin panel (admin only)
- **`/annotate`** - RSML annotation interface (requires approval)

## 📝 User Workflow

### For Regular Users
1. Register at `/register`
2. Wait for admin approval
3. Login at `/login` after approval
4. Access annotation tool from dashboard

### For Administrators
1. Login with admin credentials
2. Approve/reject users in admin dashboard
3. Access annotation tool directly
4. Manage all users

## 🔐
  "max_batch": 10
}
```

### 2. Get Maximum File Number for a Batch
```
GET /api/batch/:batch_id/files
```
**Example:** `GET /api/batch/1/files`

**Response:**
```json
{
  "max_file": 150
}
```

### 3. Get All Segments for a Batch and File
```
GET /api/batch/:batch_id/file/:file_number
```
**Example:** `GET /api/batch/1/file/1`

**Response:**
```json
[
  {
    "text": "ఈ వార్తా ధార నుండి తాజా ముఖ్యాంశాలు ఏంటి",
    "duration": 5.383,
    "lang": "te",
    "batch": "1",
    "file": "1",
    "segment": 1,
    "rsml": "...",
    ...
  }
]
```

### 4. Save RSML Data
```
POST /api/batch/:batch_id/file/:file_number/save
```
**Example:** `POST /api/batch/1/file/1/save`

**Request Body:**
```json
[
  {
    "segment": 1,
    "rsml": "updated rsml content"
  },
  {
    "segment": 2,
    "rsml": "another rsml content"
  }
]
```

**Response:**
```json
{
  "message": "RSML saved for batch 1, file 1",
  "segments_updated": 2,
  "documents_modified": 2
}
```

### Backend
| Variable | Description | Default |
|----------|-------------|---------|
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/bhasha_check` |
| `JWT_SECRET` | Secret key for JWT tokens | (required) |
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment mode | `development` |

### Frontend
| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_PORT` | Vite dev server port | `3001` |
| `VITE_API_URL` | Backend API URL | `http://localhost:3000/api` |

## 📦 Tech Stack
 the Application

### Test Authentication
1. Go to `http://localhost:3001`
2. Register a new user
3. Login as admin to approve the user
4. Login as the user to access annotation tool

### API Testing
You can test the API using:
- Postman
- Thunder Client (VS Code extension)
- cURL

**Example with authentication:**
```bash
# Get token from login response
curl -X GET http://localhost:3000/api/batches \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 📝 Important Notes

- **Authentication Required**: All voice data endpoints require a valid JWT token
- **User Approval**: Regular users must be approved by admin before accessing annotation tool
- **Admins**: Have full access without needing approval
- **Data Import**: Import CSV data before using annotation features
- **Audio Files**: Place audio files in `data/audio/` directory
- **Vite HMR**: Frontend has hot module replacement for instant updates

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000
npx kill-port 3000

# Kill process on port 3001
npx kill-port 3001
```

### MongoDB Connection Issues
- Verify MongoDB is running
- Check MONGO_URI in `.env`
- For MongoDB Atlas, check IP whitelist

### "No voice data found" Error
- Import CSV data using `npm run import`
- Verify Voice collection has documents

### Authentication Errors
- Clear browser localStorage: `localStorage.clear()`
- Check JWT_SECRET is set in server `.env`
- Verify token isn't expired

## 📚 Documentation

- **FRONTEND_GUIDE.md** - Frontend user guide and component docs
- **AUTH_README.md** - API authentication documentation
- **PROJECT_SUMMARY.md** - Complete project overview

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

## 📄 License

See LICENSE file for details.

---

**Built with ❤️ using the MERN Stack (MongoDB, Express, React + Vite, Node.js)**
- **mongoose**: MongoDB ODM
- **cors**: CORS middleware
- **compression**: Response compression
- **dotenv**: Environment variable management
- **csv-parser**: CSV file parsing (for import script)

## 🧪 Testing

You can test the API using:
- Postman
- cURL
- Thunder Client (VS Code extension)
- Your frontend application

**Example cURL command:**
```bash
curl http://localhost:3000/api/batches
```

## 📝 Notes

- This is a full MERN stack application with MongoDB database
- All CSV data must be imported into MongoDB before using the API
- Audio files should be placed in the `data/audio/` directory
- The application includes JWT-based authentication for secure access

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

## 📄 License

See LICENSE file for details.
