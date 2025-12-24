// Load environment variables first
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const compression = require('compression');
const path = require('path');
const fs = require('fs');
const connectDB = require('./config/database');
const voiceRoutes = require('./routes/voiceRoutes');
const authRoutes = require('./routes/authRoutes');

// ---------------- CONFIG ---------------- //

const PORT = process.env.PORT || 3000;
const AUDIO_DIR = path.join(__dirname, 'data', 'audio');

// -------------------------------------- //

const app = express();

// -------- Middleware -------- //

// CORS Middleware
app.use(cors({
  origin: '*',
  credentials: true
}));

// Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Compression Middleware (similar to GZip in FastAPI)
app.use(compression({
  threshold: 1000 // minimum size in bytes before compression
}));

// -------- Static Audio Serving -------- //

if (!fs.existsSync(AUDIO_DIR)) {
  console.warn(`⚠️  ${AUDIO_DIR} directory not found. Creating it now...`);
  fs.mkdirSync(AUDIO_DIR, { recursive: true });
  console.log(`✅ Created ${AUDIO_DIR} directory`);
}

app.use('/data/audio', express.static(AUDIO_DIR));

// -------- Serve React App -------- //

// Serve static files from the React app build
const clientBuildPath = path.join(__dirname, 'client', 'build');
if (fs.existsSync(clientBuildPath)) {
  app.use(express.static(clientBuildPath));
  console.log('✅ Serving React app from client/build');
}

// -------- API Routes -------- //

// Health check endpoint (public)
app.get('/api/health', async (req, res) => {
  try {
    const healthStatus = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      database: {
        status: 'connected',
        name: require('mongoose').connection.name,
        host: require('mongoose').connection.host
      },
      server: {
        port: PORT,
        audioDirectory: fs.existsSync(AUDIO_DIR) ? 'available' : 'unavailable'
      }
    };
    
    res.status(200).json(healthStatus);
  } catch (error) {
    res.status(503).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// Authentication routes (public)
app.use('/api/auth', authRoutes);

// Voice routes (protected - require authentication)
app.use('/api', voiceRoutes);

// -------- Error Handling Middleware -------- //

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

// -------- Serve React App for all other routes (SPA fallback) -------- //

app.get('*', (req, res) => {
  const clientBuildPath = path.join(__dirname, 'client', 'build', 'index.html');
  
  if (fs.existsSync(clientBuildPath)) {
    res.sendFile(clientBuildPath);
  } else {
    res.status(404).json({ 
      error: 'React app not found. Please run "npm run build" in the client directory.' 
    });
  }
});

// -------- Connect to Database & Start Server -------- //

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Start server
    app.listen(PORT, () => {
      console.log(`✅ Server is running on http://localhost:${PORT}`);
      console.log(`📁 Audio directory: ${AUDIO_DIR}`);
      console.log(`🌐 API available at http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
