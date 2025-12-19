const express = require("express");
const router = express.Router();

const {
  getAllOrganizations,
  getDepartmentsByOrg,
  getServicesByDepartment,
  getAllOfficers,
} = require("../controllers/fetchController");

// Organizations
router.get("/organizations", getAllOrganizations);

// Departments by organization
router.get("/departments/:organization_id", getDepartmentsByOrg);

// Services by department
router.get(
  "/services/:organization_id/:department_id",
  getServicesByDepartment
);

// Officers
router.get("/officers", getAllOfficers);

module.exports = router;