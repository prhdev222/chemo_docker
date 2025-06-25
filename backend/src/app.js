const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const morgan = require('morgan');
const app = express();
const patientRoutes = require('./routes/patient');
const appointmentRoutes = require('./routes/appointment');
const userRoutes = require('./routes/user');
const linkRoutes = require('./routes/links');

// Environment variables with defaults
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';
const UPLOAD_PATH = process.env.UPLOAD_PATH || './uploads';
const API_PREFIX = process.env.API_PREFIX || '/api/v1';

console.log('🔧 Environment Configuration:');
console.log(`   PORT: ${PORT}`);
console.log(`   NODE_ENV: ${NODE_ENV}`);
console.log(`   CORS_ORIGIN: ${CORS_ORIGIN}`);
console.log(`   UPLOAD_PATH: ${UPLOAD_PATH}`);
console.log(`   API_PREFIX: ${API_PREFIX}`);

// Middleware
app.use(cors({
  origin: CORS_ORIGIN,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
if (NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, '..', UPLOAD_PATH)));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    time: new Date().toISOString(),
    environment: NODE_ENV,
    version: process.env.npm_package_version || '1.0.0'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Chemo Dashboard Backend API',
    version: process.env.npm_package_version || '1.0.0',
    environment: NODE_ENV,
    endpoints: {
      health: '/api/health',
      patients: `${API_PREFIX}/patients`,
      appointments: `${API_PREFIX}/appointments`,
      users: `${API_PREFIX}/users`,
      links: `${API_PREFIX}/links`
    }
  });
});

// API routes
app.use(`${API_PREFIX}/patients`, patientRoutes);
app.use(`${API_PREFIX}/appointments`, appointmentRoutes);
app.use(`${API_PREFIX}/users`, userRoutes);
app.use(`${API_PREFIX}/links`, linkRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    path: req.originalUrl,
    method: req.method
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: NODE_ENV === 'development' ? err.message : 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${NODE_ENV}`);
  console.log(`📡 API Base URL: http://localhost:${PORT}${API_PREFIX}`);
  console.log(`🔗 Health Check: http://localhost:${PORT}/api/health`);
}); 