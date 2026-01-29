const express = require('express');
const router = express.Router();
const multer = require('multer');

// Configure Multer storage
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext)
      .replace(/\s+/g, "_");

    cb(null, `${baseName}_${timestamp}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10 MB
  }
});


const { createAppointment, uploadAppointmentDocument,createWalkinAppointment } = require('../controllers/bookAppointmentController');

// Route to create appointment (no files)
router.post('/appointments', createAppointment);
router.post('/walkin_appointments', createWalkinAppointment);
// Route to upload documents for an appointment
// Accept multiple files with field name 'documents'
router.post(
  '/appointments/:appointment_id/documents',
  upload.array('documents', 10), // max 10 files
  uploadAppointmentDocument
);

module.exports = router;