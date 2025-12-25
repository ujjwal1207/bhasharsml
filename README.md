# BhashaCheck API - MERN Stack

A full-stack MERN (MongoDB, Express, React, Node.js) application for managing voice data with authentication.

## 🚀 Features

- RESTful API for voice data management
- MongoDB integration with Mongoose ODM
- CORS enabled for cross-origin requests
- Compression middleware for optimized responses
- Static file serving for audio files
- RSML data saving functionality

## 📁 Project Structure

```
BhashaCheck/
├── config/
│   └── database.js          # MongoDB connection configuration
├── controllers/
│   └── voiceController.js   # Business logic for all routes
├── models/
│   └── Voice.js             # MongoDB schema for voice data
├── routes/
│   └── voiceRoutes.js       # API route definitions
├── scripts/
│   └── importCSV.js         # CSV to MongoDB import script
├── data/
│   └── audio/               # Audio files directory
├── .env                      # Environment variables
├── package.json             # Node.js dependencies
└── server.js                # Main application entry point
```

## 🛠️ Installation

1. **Install Node.js** (v16 or higher)

2. **Install MongoDB** (or use MongoDB Atlas)

3. **Install dependencies:**
```bash
npm install
```

4. **Configure environment variables:**
Edit the `.env` file with your MongoDB connection string:
```env
MONGO_URI=mongodb://localhost:27017/bhasha_check
PORT=3000
NODE_ENV=development
```

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
```

The server will start on `http://localhost:3000`

## 📡 API Endpoints

### 1. Get Maximum Batch Number
```
GET /api/batches
```
**Response:**
```json
{
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

### 5. Serve Index Page
```
GET /
```
Returns the `index.html` file.

### 6. Static Audio Files
```
GET /data/audio/:filename
```
**Example:** `GET /data/audio/te-1-1-1.wav`

##  Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/bhasha_check` |
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment mode | `development` |

## 📦 Dependencies

- **express**: Web framework
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
