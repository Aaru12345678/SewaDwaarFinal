const pool = require("../db");

/* =====================================================
   1️⃣ WALK-IN KPIs (Already existing – unchanged)
===================================================== */
exports.getWalkinKpis = async (req, res) => {
  try {
    const {
      state_code = null,
      division_code = null,
      district_code = null,
      taluka_code = null,
      organization_id = null,
      department_id = null,
      fromDate = null,
      toDate = null,
    } = req.query;

    const result = await pool.query(
      `SELECT * FROM get_walkin_kpis(
        $1,$2,$3,$4,$5,$6,$7,$8
      )`,
      [
        state_code,
        division_code,
        district_code,
        taluka_code,
        organization_id,
        department_id,
        fromDate,
        toDate,
      ]
    );

    res.status(200).json(result.rows[0]); // single KPI row
  } catch (err) {
    console.error("Walkin KPI error:", err);
    res.status(500).json({ message: "Failed to fetch walk-in KPIs" });
  }
};

/* =====================================================
   2️⃣ WALK-INS TREND (DAY / MONTH / YEAR)
===================================================== */
exports.getWalkinsTrend = async (req, res) => {
  try {
    const {
      dateType = "day",
      state_code = null,
      division_code = null,
      district_code = null,
      taluka_code = null,
      fromDate = null,
      toDate = null,
      organization_id = null,
      department_id = null,
      service_id = null,
    } = req.query;

    const result = await pool.query(
      `SELECT * FROM get_walkins_trend(
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10
      )`,
      [
        dateType,
        state_code,
        division_code,
        district_code,
        taluka_code,
        fromDate,
        toDate,
        organization_id,
        department_id,
        service_id,
      ]
    );

    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Walkins Trend error:", err);
    res.status(500).json({ message: "Failed to fetch walk-ins trend" });
  }
};

/* =====================================================
   3️⃣ WALK-INS BY DEPARTMENT (BAR CHART)
===================================================== */
exports.getWalkinsByDepartment = async (req, res) => {
  try {
    const {
      state_code = null,
      division_code = null,
      district_code = null,
      taluka_code = null,
      fromDate = null,
      toDate = null,
      organization_id = null,
      department_id = null,
    } = req.query;

    const result = await pool.query(
      `SELECT * FROM get_walkins_by_department(
        $1,$2,$3,$4,$5,$6,$7,$8
      )`,
      [
        state_code,
        division_code,
        district_code,
        taluka_code,
        fromDate,
        toDate,
        organization_id,
        department_id,
      ]
    );

    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Walkins by Department error:", err);
    res.status(500).json({ message: "Failed to fetch walk-ins by department" });
  }
};

/* =====================================================
   4️⃣ WALK-INS BY SERVICE (BAR CHART)
===================================================== */
exports.getWalkinsByService = async (req, res) => {
  try {
    const {
      state_code = null,
      division_code = null,
      district_code = null,
      taluka_code = null,
      fromDate = null,
      toDate = null,
      organization_id = null,
      department_id = null,
      service_id = null,
    } = req.query;

    const result = await pool.query(
      `SELECT * FROM get_walkins_by_service(
        $1,$2,$3,$4,$5,$6,$7,$8,$9
      )`,
      [
        state_code,
        division_code,
        district_code,
        taluka_code,
        fromDate,
        toDate,
        organization_id,
        department_id,
        service_id,
      ]
    );

    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Walkins by Service error:", err);
    res.status(500).json({ message: "Failed to fetch walk-ins by service" });
  }
};