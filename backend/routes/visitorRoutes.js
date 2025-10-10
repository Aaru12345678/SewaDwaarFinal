const express = require("express");
const router = express.Router();
const visitorController = require("../controllers/visitorController");

// GET dashboard for a visitor by username
router.get("/:username/dashboard", visitorController.getVisitorDashboard);

module.exports = router;
