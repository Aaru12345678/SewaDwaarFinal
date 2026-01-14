const express = require('express');
const router = express.Router();
const multer = require('multer');

// Configure Multer storage
const upload = multer({ dest: 'uploads/' }); // basic storage, can be customized

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