const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');

// Protect all routes in this file
router.use(authenticateToken);

// GET นัดหมายทั้งหมด (รวมข้อมูลผู้ป่วย) - All authenticated users
router.get('/', authorizeRoles('ADMIN', 'DOCTOR', 'NURSE'), async (req, res) => {
  try {
    const appointments = await prisma.appointment.findMany({
      include: { patient: true }, // ดึงข้อมูลผู้ป่วยมาด้วย
      orderBy: { date: 'asc' }
    });
    res.json(appointments);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST สร้างนัดหมายใหม่ (สัมพันธ์กับ patient) - Admin, Doctor, Nurse
router.post('/', authorizeRoles('ADMIN', 'DOCTOR', 'NURSE'), async (req, res) => {
  try {
    const data = req.body;
    // ตรวจสอบว่า patientId มีอยู่จริง
    const patient = await prisma.patient.findUnique({ where: { id: Number(data.patientId) } });
    if (!patient) {
      return res.status(400).json({ error: 'patientId ไม่ถูกต้อง หรือไม่มีในฐานข้อมูล' });
    }
    // สร้าง appointment ที่สัมพันธ์กับ patient
    const appointment = await prisma.appointment.create({
      data: {
        patientId: Number(data.patientId),
        date: new Date(data.date),
        chemoRegimen: data.chemoRegimen,
        admitStatus: data.admitStatus,
        admitDate: data.admitDate ? new Date(data.admitDate) : undefined,
        dischargeDate: data.dischargeDate ? new Date(data.dischargeDate) : undefined,
        referHospital: data.referHospital || undefined,
        referDate: data.referDate ? new Date(data.referDate) : undefined,
        note: data.note || undefined,
      }
    });
    res.json(appointment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT แก้ไขนัดหมาย - Admin, Doctor, Nurse
router.put('/:id', authenticateToken, authorizeRoles('ADMIN', 'DOCTOR', 'NURSE'), async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    // Convert date strings to Date objects if they exist
    if (data.date) data.date = new Date(data.date);
    if (data.referDate) data.referDate = new Date(data.referDate);

    const appointment = await prisma.appointment.update({
      where: { id: Number(id) },
      data
    });
    res.json(appointment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE ลบนัดหมาย - Admin only
router.delete('/:id', authorizeRoles('ADMIN'), async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.appointment.delete({ where: { id: Number(id) } });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PATCH อัปเดตสถานะ (admit/discharge) - All authenticated users
router.patch('/:id/status', authorizeRoles('ADMIN', 'DOCTOR', 'NURSE'), async (req, res) => {
  try {
    const { id } = req.params;
    const { admitStatus, admitDate, dischargeDate } = req.body;
    const appointment = await prisma.appointment.update({
      where: { id: Number(id) },
      data: {
        admitStatus,
        admitDate: admitDate ? new Date(admitDate) : undefined,
        dischargeDate: dischargeDate ? new Date(dischargeDate) : undefined,
      }
    });
    res.json(appointment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router; 