const express = require("express");
const router = express.Router();
const controller = require("../controllers/walkinAnalyticsController");

router.get("/kpis", controller.getWalkinKpis);
router.get("/trend", controller.getWalkinsTrend);
router.get("/by-department", controller.getWalkinsByDepartment);
router.get("/by-service", controller.getWalkinsByService);

module.exports = router;