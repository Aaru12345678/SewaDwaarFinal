const pool = require("../db"); // your PG pool

/* ================= GET ALL HOLIDAYS ================= */
exports.getSlotHolidays = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM get_slot_holidays()");
    res.status(200).json({ data: result.rows || [] }); // always return array
  } catch (err) {
    console.error("Error fetching holidays:", err);
    res.status(500).json({ data: [] }); // fallback to empty array
  }
};

/* ================= CREATE NEW HOLIDAY ================= */
exports.createSlotHoliday = async (req, res) => {
  try {
    const {
      organization_id,
      department_id,
      service_id,
      state_code,
      division_code,
      district_code,
      taluka_code,
      holiday_date,
      description
    } = req.body;

    if (!holiday_date || !description) {
      return res.status(400).json({ error: "Date and description are required" });
    }

    const result = await pool.query(
      `SELECT create_slot_holiday($1,$2,$3,$4,$5,$6,$7,$8,$9) AS holiday_id`,
      [
        organization_id || null,
        department_id || null,
        service_id || null,
        state_code || null,
        division_code || null,
        district_code || null,
        taluka_code || null,
        holiday_date,
        description
      ]
    );

    res.status(201).json({ 
      success: true, 
      holiday_id: result.rows[0].holiday_id 
    });
  } catch (err) {
    console.error("Error creating holiday:", err);
    res.status(500).json({ error: "Failed to create holiday" });
  }
};

/* ================= DEACTIVATE HOLIDAY ================= */
exports.deactivateSlotHoliday = async (req, res) => {
  try {
    const { holiday_id } = req.params;
    if (!holiday_id) return res.status(400).json({ error: "Holiday ID is required" });

    await pool.query(`SELECT deactivate_slot_holiday($1)`, [holiday_id]);
    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Error deactivating holiday:", err);
    res.status(500).json({ error: "Failed to deactivate holiday" });
  }
};

/* Update holiday */
exports.updateSlotHoliday = async (req, res) => {
  try {
    const { holiday_id } = req.params;

    const {
      organization_id,
      department_id,
      service_id,
      state_code,
      division_code,
      district_code,
      taluka_code,
      holiday_date,
      description
    } = req.body;

    const result = await pool.query(
      `SELECT update_slot_holiday(
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10
      ) AS updated`,
      [
        holiday_id,
        organization_id || null,
        department_id || null,
        service_id || null,
        state_code || null,
        division_code || null,
        district_code || null,
        taluka_code || null,
        holiday_date,
        description
      ]
    );

    if (!result.rows[0].updated) {
      return res.status(404).json({ error: "Holiday not found or inactive" });
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update holiday" });
  }
};

exports.getHolidayForEdit = async (req, res) => {
  try {
    const { holiday_id } = req.params;

    const result = await pool.query(
      "SELECT * FROM get_slot_holiday_by_id($1)",
      [holiday_id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ error: "Holiday not found" });
    }

    res.json({ data: result.rows[0] });
  } catch (err) {
    console.error("Error fetching holiday for edit:", err);
    res.status(500).json({ error: "Failed to fetch holiday" });
  }
};