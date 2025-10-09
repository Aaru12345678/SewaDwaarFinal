const express = require("express");
const router = express.Router();
const multer = require("multer");
const { insertOfficerSignup, loginOfficer } = require("../controllers/officerController");

// Store uploaded photos in 'uploads/' folder
const upload = multer({ dest: "uploads/" });

// Officer registration route
router.post("/officers_signup", upload.single("photo"), insertOfficerSignup);

router.post("/officers_login", loginOfficer);


module.exports = router;
