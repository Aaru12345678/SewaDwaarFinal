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
router.get("/organizations/:organization_id/departments", getDepartmentsByOrg);

// Services by department
router.get(
  "/fetch/services/:organization_id/:department_id",
  getServicesByDepartment
);


// Officers
router.get("/officers", getAllOfficers);

module.exports = router;