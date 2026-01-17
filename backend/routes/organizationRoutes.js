const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: "uploads/" });


const { addOrganization } = require("../controllers/organizationController");
const {
  getOrganizationById,UpdateaddBulkDepartments,updateMultipleServices
} = require("../controllers/organizationController");
const {
  updateOrganization,getServiceById,getUserByEntityId,updateOfficerByRole
} = require("../controllers/organizationController");

router.put("/organization/:organization_id", updateOrganization);

router.get("/organization/:id", getOrganizationById);

// POST -> Create org + departments + services
router.post("/organization", addOrganization);

router.put("/update-departments", UpdateaddBulkDepartments);

router.get("/getServices/:service_id", getServiceById);

router.put("/update-services", updateMultipleServices);

router.get("/user/entity/:entity_id", getUserByEntityId);

router.put("/update-officer", upload.single("photo"),updateOfficerByRole)

module.exports = router;