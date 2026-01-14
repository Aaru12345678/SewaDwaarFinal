const express = require("express");
const router = express.Router();

const { addOrganization } = require("../controllers/organizationController");
const {
  getOrganizationById
} = require("../controllers/organizationController");
const {
  updateOrganization
} = require("../controllers/organizationController");

router.put("/organization/:organization_id", updateOrganization);

router.get("/organization/:id", getOrganizationById);

// POST -> Create org + departments + services
router.post("/organization", addOrganization);

module.exports = router;