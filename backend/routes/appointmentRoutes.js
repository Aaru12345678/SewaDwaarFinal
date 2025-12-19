// routes/appointmentRoutes.js
const express = require("express");
const router = express.Router();

const { cancelAppointment } = require("../controllers/appointmentController");
const {
  getAppointmentsSummary
} = require("../controllers/appointmentController");
const { getRolesSummary } = require("../controllers/appointmentController");
const {getAppointmentDetails} = require("../controllers/appointmentController");

// GET roles summary
router.get("/usersummary", getRolesSummary);


// GET appointments summary
router.get("/summary", getAppointmentsSummary);

// PUT /api/appointments/cancel/:id
router.put("/cancel/:id", cancelAppointment);

// GET appointment details
router.get(
  "/:appointmentId",
  getAppointmentDetails
);

module.exports = router;


