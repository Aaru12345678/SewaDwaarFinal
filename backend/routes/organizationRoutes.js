const express = require("express");
const router = express.Router();

const { addOrganization } = require("../controllers/organizationController");

// POST -> Create org + departments + services
router.post("/organization", addOrganization);

module.exports = router;