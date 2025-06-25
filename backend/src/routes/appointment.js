const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');
const appointmentController = require('../controllers/appointmentController');

// Protect all routes in this file
router.use(authenticateToken);

// GET all appointments
router.get('/', authorizeRoles('ADMIN', 'DOCTOR', 'NURSE'), appointmentController.getAllAppointments);

// POST create appointment
router.post('/', authorizeRoles('ADMIN', 'DOCTOR', 'NURSE'), appointmentController.createAppointment);

// PUT update appointment
router.put('/:id', authenticateToken, authorizeRoles('ADMIN', 'DOCTOR', 'NURSE'), appointmentController.updateAppointment);

// DELETE appointment
router.delete('/:id', authorizeRoles('ADMIN'), appointmentController.deleteAppointment);

// PATCH update status
router.patch('/:id/status', authorizeRoles('ADMIN', 'DOCTOR', 'NURSE'), appointmentController.updateAppointmentStatus);

module.exports = router; 