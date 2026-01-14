const express = require("express");
const router = express.Router();

const {
  getApplicationAppointmentKpis,
  getApplicationAppointmentsTrend,
  getAppointmentsByDepartment,
  getAppointmentsByService,
} = require("../controllers/analyticsController");

/* ---------- KPI CARDS ---------- */
router.get("/application/kpis", getApplicationAppointmentKpis);

/* ---------- TREND CHART ---------- */
router.get("/application/trend", getApplicationAppointmentsTrend);

/* ---------- DEPARTMENT CHART ---------- */
router.get("/application/by-department", getAppointmentsByDepartment);

/* ---------- SERVICE CHART ---------- */
router.get("/application/by-service", getAppointmentsByService);

module.exports = router;