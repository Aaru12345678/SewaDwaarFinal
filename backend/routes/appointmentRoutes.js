// routes/appointmentRoutes.js
const express = require("express");
const router = express.Router();

const {
  cancelAppointment,
  getAppointmentsSummary,
  getRolesSummary,
  getAppointmentDetails,
  deleteAppointment
} = require("../controllers/appointmentController");

// ============================
// GET roles summary
// ============================
router.get("/usersummary", getRolesSummary);

// ============================
// GET appointments summary (with date filters)
// ============================
router.get("/summary", getAppointmentsSummary);

// ============================
// PUT cancel appointment
// ============================
router.put("/cancel/:id", cancelAppointment);

// ============================
// GET appointment details
// ============================
router.get("/:appointmentId", getAppointmentDetails);

// ============================
// DELETE appointment (ADMIN)
// ============================
router.delete("/:id", deleteAppointment);

module.exports = router;
