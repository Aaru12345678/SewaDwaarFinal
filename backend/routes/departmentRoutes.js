const express = require("express");
const router = express.Router();
const { addBulkDepartments,getActiveDepartmentsCount } = require("../controllers/departmentController");

router.post("/bulk", addBulkDepartments);

router.get("/activedepartments", getActiveDepartmentsCount);

module.exports = router;