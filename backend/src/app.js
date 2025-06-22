const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const app = express();
const patientRoutes = require('./routes/patient');
const appointmentRoutes = require('./routes/appointment');
const userRoutes = require('./routes/user');
const linkRoutes = require('./routes/links');

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ตัวอย่าง route หลัก (จะเพิ่ม route จริงในขั้นถัดไป)
app.get('/', (req, res) => {
  res.send('Chemo Dashboard Backend API');
});

// TODO: เพิ่ม route อื่น ๆ เช่น /api/patients, /api/appointments
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/links', linkRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 