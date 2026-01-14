const express = require("express");
const router = express.Router();
const { addBulkDepartments,getActiveDepartmentsCount,getDepartmentById } = require("../controllers/departmentController");
router.get('/:department_id', getDepartmentById);
router.post("/bulk", addBulkDepartments);

router.get("/activedepartments", getActiveDepartmentsCount);


module.exports = router;