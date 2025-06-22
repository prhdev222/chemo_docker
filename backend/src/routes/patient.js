const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');

// Protect all routes in this file
router.use(authenticateToken);

// CREATE - Admin, Doctor, Nurse
router.post('/', authorizeRoles('ADMIN', 'DOCTOR', 'NURSE'), async (req, res) => {
  try {
    const { hn, firstName, lastName, birthDate, phone, lineId, address, status } = req.body;
    
    if (!hn || !firstName || !lastName || !birthDate) {
        return res.status(400).json({ error: "HN, First Name, Last Name, and Birth Date are required." });
    }

    const patient = await prisma.patient.create({ 
      data: {
        hn,
        firstName,
        lastName,
        birthDate: new Date(birthDate),
        phone,
        lineId,
        address,
        status: status || 'ACTIVE',
        treatmentPlan: {}, // Default value
      }
    });
    res.status(201).json(patient);
  } catch (err) {
    console.error(err);
    if (err.code === 'P2002') {
        return res.status(409).json({ error: `Patient with HN ${req.body.hn} already exists.`});
    }
    res.status(400).json({ error: "Could not create patient." });
  }
});

// READ All - All authenticated users
router.get('/', async (req, res) => {
  try {
    const patients = await prisma.patient.findMany({
      where: { isDeleted: false },
      orderBy: { createdAt: 'desc' }
    });
    res.json(patients);
  } catch (err) {
    res.status(500).json({ error: "Could not fetch patients." });
  }
});

// READ by ID
router.get('/id/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const patient = await prisma.patient.findUnique({ where: { id: parseInt(id) } });
    if (!patient || patient.isDeleted) {
        return res.status(404).json({ error: "Patient not found" });
    }
    res.json(patient);
  } catch (err) {
    res.status(500).json({ error: "Could not fetch patient." });
  }
});

// UPDATE by ID - Admin, Doctor, Nurse
router.put('/id/:id', authorizeRoles('ADMIN', 'DOCTOR', 'NURSE'), async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    
    if (data.birthDate) data.birthDate = new Date(data.birthDate);
    if (data.diagnosisDate) data.diagnosisDate = new Date(data.diagnosisDate);

    const patient = await prisma.patient.update({ 
      where: { id: parseInt(id) }, 
      data 
    });
    res.json(patient);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Could not update patient." });
  }
});

// SOFT DELETE by ID - Admin only
router.delete('/id/:id', authorizeRoles('ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.patient.update({ 
      where: { id: parseInt(id) }, 
      data: { isDeleted: true } 
    });
    res.status(204).send();
  } catch (err) {
    res.status(400).json({ error: "Could not delete patient." });
  }
});

// Search by HN or name - All authenticated users
router.get('/search/:query', authorizeRoles('ADMIN', 'DOCTOR', 'NURSE'), async (req, res) => {
  // ... existing code ...
});

module.exports = router; 