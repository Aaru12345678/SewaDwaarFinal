const express = require('express');
const router = express.Router();
const {
  getStates,
  getDivisions,
  getDistricts,
  getTalukas,
  getOrganization,
  getDepartment,
  getServices,
  getDesignations,
  getServices2
  
} = require('../controllers/locationController');

router.get('/states', getStates);
router.get('/divisions/:state_code', getDivisions);
router.get('/districts', getDistricts);
router.get('/talukas', getTalukas);
router.get('/designations',getDesignations)
// a
router.get('/organization',getOrganization);
router.get('/department/:organization_id',getDepartment);
router.get('/services/:organization_id/:department_id',getServices);
router.get('/services/:organization_id',getServices2);

// 

module.exports = router;
