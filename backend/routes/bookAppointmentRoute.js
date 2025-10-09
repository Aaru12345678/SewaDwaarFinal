const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // or configure storage for better control

const { createAppointment } = require('../controllers/bookAppointmentController');

// Handle multipart/form-data with file uploads
router.post('/appointments', upload.array('documents'), createAppointment);

module.exports = router;
