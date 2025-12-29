const express = require("express");
const router = express.Router();
const multer = require("multer");
const { insertOfficerSignup, loginOfficer,getOfficersByLocation,getOfficerDashboard, updateAppointmentStatus, rescheduleAppointment, getAppointmentsByDate, getOfficerReports } = require("../controllers/officerController");
const pool = require("../db"); // import your PostgreSQL pool

// Store uploaded photos in 'uploads/' folder
const upload = multer({ dest: "uploads/" });

// User registration route (Admin / Officer / Helpdesk)
router.post("/users_signup", upload.single("photo"), insertOfficerSignup);

router.post("/getOfficersByLocation", getOfficersByLocation);

// Login route for any role
router.post("/users_login", loginOfficer);

// Officer Dashboard
router.get(
  "/officer/:officer_id/dashboard",
  getOfficerDashboard
);

// Appointment action routes
// Update appointment status by officer
router.put("/appointment/update-status",updateAppointmentStatus);
// Reschedule appointment
router.put("/appointment/reschedule",rescheduleAppointment);

// Get appointments by date for reports
router.get("/officer/:officer_id/appointments-by-date",getAppointmentsByDate);

// Get officer reports
router.get(  "/officer/:officer_id/reports",  getOfficerReports);



router.get("/roles", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM get_roles();"); // DB function
    res.json({ success: true, roles: result.rows });
  } catch (error) {
    console.error("❌ Error fetching roles:", error);
    res.status(500).json({ success: false, message: "Failed to fetch roles", error: error.message });
  }
});

module.exports = router;
