const express = require("express");
const router = express.Router();
const multer = require("multer");
const { insertOfficerSignup, loginOfficer,getOfficersByLocation } = require("../controllers/officerController");
const pool = require("../db"); // import your PostgreSQL pool

// Store uploaded photos in 'uploads/' folder
const upload = multer({ dest: "uploads/" });

// User registration route (Admin / Officer / Helpdesk)
router.post("/users_signup", upload.single("photo"), insertOfficerSignup);

router.post("/getOfficersByLocation", getOfficersByLocation);

// Login route for any role
router.post("/users_login", loginOfficer);

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
