const express = require("express");
const router = express.Router();
const slotCtrl = require("../controllers/slotConfigController");

router.get("/configs", slotCtrl.getSlotConfigs);
router.post("/preview", slotCtrl.previewSlots);
router.post("/create", slotCtrl.createSlotConfig);
router.put("/update", slotCtrl.updateSlotConfig);
router.delete("/deactivate/:slot_config_id", slotCtrl.deactivateSlotConfig);
router.get("/available-slots", slotCtrl.getAvailableSlots1);

module.exports = router;