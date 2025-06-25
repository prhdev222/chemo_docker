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

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// ตัวอย่าง route หลัก (จะเพิ่ม route จริงในขั้นถัดไป)
app.get('/', (req, res) => {
  res.send('Chemo Dashboard Backend API');
});

// TODO: เพิ่ม route อื่น ๆ เช่น /api/patients, /api/appointments
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/links', linkRoutes);

// Error handler กลาง
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 