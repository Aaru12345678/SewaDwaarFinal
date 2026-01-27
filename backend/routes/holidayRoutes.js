const express = require("express");
const router = express.Router();
const holidayCtrl = require("../controllers/holidayController");

// Get all holidays
router.get("/slot-holidays", holidayCtrl.getSlotHolidays);

// Create new holiday
router.post("/slot-holidays", holidayCtrl.createSlotHoliday);

// Deactivate holiday
router.delete("/slot-holidays/:holiday_id", holidayCtrl.deactivateSlotHoliday);

// Update holiday
router.put("/slot-holidays/:holiday_id", holidayCtrl.updateSlotHoliday);

// GET holiday for edit
router.get("/slot-holidays/:holiday_id", holidayCtrl.getHolidayForEdit);


module.exports = router;