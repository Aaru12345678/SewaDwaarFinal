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
  getDesignations
  
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

// 

module.exports = router;
