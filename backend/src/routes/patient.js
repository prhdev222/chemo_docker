const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');
const multer = require('multer');
const path = require('path');

// Multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'src/uploads/');
  },
  filename: function (req, file, cb) {
    // Use patient HN and original file name for more clarity
    const safeOriginalName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_');
    const uniqueSuffix = Date.now();
    cb(null, `patient_${req.params.id}_${uniqueSuffix}_${safeOriginalName}`);
  }
});

// Use upload.array() to accept multiple files
const upload = multer({ storage: storage });

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

// UPDATE by ID - Now handles multiple file uploads
router.put(
    '/id/:id',
    authorizeRoles('ADMIN', 'DOCTOR', 'NURSE'),
    upload.array('newAttachments'), // Expect an array of files from a field named 'newAttachments'
    async (req, res) => {
        try {
            const { id } = req.params;
            const data = req.body;

            // Find patient to get existing attachments
            const patient = await prisma.patient.findUnique({ where: { id: parseInt(id) } });
            if (!patient) {
                return res.status(404).json({ error: "Patient not found" });
            }

            // Initialize or parse existing attachments
            let existingAttachments = [];
            if (patient.attachments && Array.isArray(patient.attachments)) {
                existingAttachments = patient.attachments;
            }

            // Handle new file uploads
            if (req.files && req.files.length > 0) {
                const attachmentNames = req.body.attachmentNames ? JSON.parse(req.body.attachmentNames) : [];
                const newAttachments = req.files.map((file, index) => ({
                    // Use provided name or default to original filename
                    name: attachmentNames[index] || file.originalname,
                    path: `uploads/${file.filename}`
                }));
                existingAttachments.push(...newAttachments);
            }
            
            data.attachments = existingAttachments;

            // Convert date strings to Date objects
            if (data.birthDate) data.birthDate = new Date(data.birthDate);
            if (data.diagnosisDate) data.diagnosisDate = new Date(data.diagnosisDate);
            
            // Parse JSON strings if they are strings
            if (data.treatmentPlan && typeof data.treatmentPlan === 'string') {
                data.treatmentPlan = JSON.parse(data.treatmentPlan);
            }
             if (data.followUp && typeof data.followUp === 'string') {
                data.followUp = JSON.parse(data.followUp);
            }
            // ... add for other json fields if needed

            // Remove the file field from data if it exists, as it's not a DB field
            delete data.newAttachments;
            delete data.attachmentNames;

            const updatedPatient = await prisma.patient.update({
                where: { id: parseInt(id) },
                data
            });
            res.json(updatedPatient);
        } catch (err) {
            console.error("Update error:", err);
            res.status(400).json({ error: "Could not update patient." });
        }
    }
);

// New route to DELETE an attachment
router.put('/id/:id/delete-attachment', authorizeRoles('ADMIN', 'DOCTOR', 'NURSE'), async (req, res) => {
    try {
        const { id } = req.params;
        const { attachmentPath } = req.body; // The path of the file to delete

        if (!attachmentPath) {
            return res.status(400).json({ error: "Attachment path is required." });
        }

        const patient = await prisma.patient.findUnique({ where: { id: parseInt(id) } });
        if (!patient || !patient.attachments || !Array.isArray(patient.attachments)) {
            return res.status(404).json({ error: "Patient or attachments not found." });
        }
        
        // Filter out the attachment to be deleted
        const updatedAttachments = patient.attachments.filter(att => att.path !== attachmentPath);

        // Here you might want to also delete the file from the server filesystem
        // const fs = require('fs');
        // fs.unlink(path.join(__dirname, '..', attachmentPath), (err) => {
        //   if (err) console.error("Error deleting file:", err);
        // });

        const updatedPatient = await prisma.patient.update({
            where: { id: parseInt(id) },
            data: { attachments: updatedAttachments }
        });

        res.json(updatedPatient);

    } catch (err) {
        console.error("Delete attachment error:", err);
        res.status(500).json({ error: "Could not delete attachment." });
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