const express = require('express');
const cors = require('cors');
const compression = require('compression');
const path = require('path');
const fs = require('fs');
const connectDB = require('./config/database');
const voiceRoutes = require('./routes/voiceRoutes');

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
  console.error(`❌ ${AUDIO_DIR} directory not found`);
  process.exit(1);
}

app.use('/data/audio', express.static(AUDIO_DIR));

// -------- Serve Index HTML -------- //

app.get('/', (req, res) => {
  const indexPath = path.join(__dirname, 'index.html');
  
  if (!fs.existsSync(indexPath)) {
    return res.status(404).json({ error: 'index.html not found' });
  }
  
  res.sendFile(indexPath);
});

// -------- API Routes -------- //

app.use('/api', voiceRoutes);

// -------- Error Handling Middleware -------- //

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

// -------- 404 Handler -------- //

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
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
