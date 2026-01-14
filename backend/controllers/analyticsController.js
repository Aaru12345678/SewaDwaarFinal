const pool = require("../db");

// ---------------- KPIs ----------------
exports.getApplicationAppointmentKpis = async (req, res) => {
  try {
    const {
      state_code = null,
      division_code = null,
      district_code = null,
      taluka_code = null,
      org_id = null,
      dept_id = null,
      service_id = null,
      fromDate = null,
      toDate = null,
    } = req.query;

    const result = await pool.query(
      `SELECT * FROM get_application_appointment_kpis(
        $1, $2, $3, $4, $5, $6, $7, $8, $9
      )`,
      [
        state_code || null,
        division_code || null,
        district_code || null,
        taluka_code || null,
        org_id || null,
        dept_id || null,
        service_id || null,
        fromDate || null,
        toDate || null,
      ]
    );

    res.status(200).json(result.rows[0] || {
      total_appointments: 0,
      upcoming_appointments: 0,
      completed_appointments: 0,
      rejected_appointments: 0,
      pending_appointments: 0,
    });
  } catch (error) {
    console.error("Error fetching appointment KPIs:", error);
    res.status(500).json({ message: "Failed to fetch appointment KPI data" });
  }
};

// ---------------- TREND ----------------
exports.getApplicationAppointmentsTrend = async (req, res) => {
  try {
    const {
      dateType = "month",
      state_code = null,
      division_code = null,
      district_code = null,
      taluka_code = null,
      fromDate = null,
      toDate = null,
      org_id = null,
      dept_id = null,
      service_id = null,
    } = req.query;

    const result = await pool.query(
      `SELECT * FROM get_application_appointments_trend(
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10
      )`,
      [
        dateType,
        state_code || null,
        division_code || null,
        district_code || null,
        taluka_code || null,
        fromDate || null,
        toDate || null,
        org_id || null,
        dept_id || null,
        service_id || null,
      ]
    );

    res.status(200).json(result.rows || []);
  } catch (error) {
    console.error("Error fetching appointment trend:", error);
    res.status(500).json({ message: "Failed to fetch appointment trend data" });
  }
};

// ---------------- APPOINTMENTS BY DEPARTMENT ----------------
exports.getAppointmentsByDepartment = async (req, res) => {
  try {
    const {
      state_code = null,
      division_code = null,
      district_code = null,
      taluka_code = null,
      fromDate = null,
      toDate = null,
      org_id = null,
      dept_id = null,
    } = req.query;

    const result = await pool.query(
      `SELECT * FROM get_appointments_by_department(
        $1,$2,$3,$4,$5,$6,$7,$8
      )`,
      [
        state_code || null,
        division_code || null,
        district_code || null,
        taluka_code || null,
        fromDate || null,
        toDate || null,
        org_id || null,
        dept_id || null,
      ]
    );

    res.status(200).json(result.rows || []);
  } catch (error) {
    console.error("Error fetching appointments by department:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch appointments by department" });
  }
};


// ---------------- APPOINTMENTS BY SERVICE ----------------
exports.getAppointmentsByService = async (req, res) => {
  try {
    const {
      state_code = null,
      division_code = null,
      district_code = null,
      taluka_code = null,
      fromDate = null,
      toDate = null,
      org_id = null,
      dept_id = null,
      service_id = null,
    } = req.query;

    const result = await pool.query(
      `SELECT * FROM get_appointments_by_service(
        $1,$2,$3,$4,$5,$6,$7,$8,$9
      )`,
      [
        state_code || null,
        division_code || null,
        district_code || null,
        taluka_code || null,
        fromDate || null,
        toDate || null,
        org_id || null,
        dept_id || null,
        service_id || null,
      ]
    );

    res.status(200).json(result.rows || []);
  } catch (error) {
    console.error("Error fetching appointments by service:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch appointments by service" });
  }
};
