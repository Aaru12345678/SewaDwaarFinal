const express = require('express');
const router = express.Router();
const {
  getStates,
  getDivisions,
  getDistricts,
  getTalukas,
  
} = require('../controllers/locationController');

router.get('/states', getStates);


router.get('/divisions/:state_code', getDivisions);
router.get('/districts', getDistricts);
router.get('/talukas', getTalukas);

module.exports = router;
