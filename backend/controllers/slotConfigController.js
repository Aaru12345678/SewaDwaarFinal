const pool = require("../db");

/* =====================================================
   1️⃣ GET SLOT CONFIG LIST (Admin Table)
===================================================== */
exports.getSlotConfigs = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM get_slot_configs()`
    );
    res.json(result.rows);
  } catch (err) {
    console.error("getSlotConfigs error:", err);
    res.status(500).json({ error: "Failed to fetch slot configs" });
  }
};

/* =====================================================
   2️⃣ PREVIEW GENERATED SLOTS (Admin UI)
===================================================== */
exports.previewSlots = async (req, res) => {
  try {
    const {
      start_time,
      end_time,
      slot_duration_minutes,
      buffer_minutes,
    } = req.body;

    const result = await pool.query(
      `SELECT * FROM preview_generated_slots($1, $2, $3, $4)`,
      [
        start_time,
        end_time,
        slot_duration_minutes,
        buffer_minutes,
      ]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("previewSlots error:", err);
    res.status(500).json({ error: "Slot preview failed" });
  }
};

/* =====================================================
   3️⃣ CREATE SLOT CONFIG (WITH BREAKS)
===================================================== */
exports.createSlotConfig = async (req, res) => {
  try {
    const {
      organization_id,
      department_id,
      service_id,
      officer_id,

      state_code,
      division_code,
      district_code,
      taluka_code,

      day_of_week,
      start_time,
      end_time,

      slot_duration_minutes,
      buffer_minutes,
      max_capacity,

      effective_from,
      effective_to,

      breaks, // array [{from,to,reason}]
    } = req.body;
    console.log(req.body,"req.body")
    const result = await pool.query(
      `
      SELECT create_slot_config(
        $1,$2,$3,$4,
        $5,$6,$7,$8,
        $9,$10,$11,
        $12,$13,$14,
        $15,$16,
        $17
      ) AS slot_config_id
      `,
      [
        organization_id,
        department_id,
        service_id,
        officer_id,

        state_code,
        division_code,
        district_code,
        taluka_code,

        day_of_week,
        start_time,
        end_time,

        slot_duration_minutes,
        buffer_minutes,
        max_capacity,

        effective_from,
        effective_to,

        breaks ? JSON.stringify(breaks) : null,
      ]
    );
    console.log(result,"result")
    res.status(201).json({
      message: "Slot configuration created",
      slot_config_id: result.rows[0].slot_config_id,
    });
  } catch (err) {
    console.error("createSlotConfig error:", err);
    res.status(400).json({
      error: err.message || "Slot config creation failed",
    });
  }
};

/* =====================================================
   4️⃣ UPDATE SLOT CONFIG (EDIT)
===================================================== */
exports.updateSlotConfig = async (req, res) => {
  try {
    const {
      slot_config_id,

      // ORG HIERARCHY
      organization_id,
      department_id,
      service_id,
      officer_id,

      // LOCATION HIERARCHY
      state_code,
      division_code,
      district_code,
      taluka_code,

      // SLOT RULES
      day_of_week,
      start_time,
      end_time,
      slot_duration_minutes,
      buffer_minutes,
      max_capacity,

      // VALIDITY
      effective_from,
      effective_to,
    } = req.body;

    await pool.query(
      `
      SELECT update_slot_config(
        $1,  $2,  $3,  $4,  $5,
        $6,  $7,  $8,  $9,
        $10, $11, $12,
        $13, $14, $15,
        $16, $17
      )
      `,
      [
        slot_config_id,

        organization_id,
        department_id,
        service_id,
        officer_id,

        state_code,
        division_code,
        district_code,
        taluka_code,

        day_of_week,
        start_time,
        end_time,

        slot_duration_minutes,
        buffer_minutes,
        max_capacity,

        effective_from,
        effective_to,
      ]
    );

    res.json({ message: "Slot configuration updated successfully" });
  } catch (err) {
    console.error("updateSlotConfig error:", err);

    /* ⚠️ Conflict exception from PostgreSQL */
    if (err.message?.includes("Slot configuration conflict")) {
      return res.status(409).json({
        error: "Slot configuration conflict detected",
      });
    }

    res.status(500).json({ error: "Slot update failed" });
  }
};

/* =====================================================
   5️⃣ DEACTIVATE SLOT CONFIG (SOFT DELETE)
===================================================== */
exports.deactivateSlotConfig = async (req, res) => {
  try {
    const { slot_config_id } = req.params;

    await pool.query(
      `SELECT deactivate_slot_config($1)`,
      [slot_config_id]
    );

    res.json({ message: "Slot configuration deactivated" });
  } catch (err) {
    console.error("deactivateSlotConfig error:", err);
    res.status(500).json({ error: "Slot deactivation failed" });
  }
};

/* =====================================================
   6️⃣ GET AVAILABLE SLOTS (Booking + Walk-in)
===================================================== */
exports.getAvailableSlots1 = async (req, res) => {
  try {
    const {
      p_date,
      p_organization_id,
      p_service_id,
      p_state_code,
      p_division_code,
      p_department_id,
      p_district_code,
      p_taluka_code,
    } = req.query;   // ✅ FIXED

    console.log(req.query, "query");

    const result = await pool.query(
      "SELECT * FROM get_available_slots($1,$2,$3,$4,$5,$6,$7,$8)",
      [
        p_date,
        p_organization_id,
        p_service_id,
        p_state_code,
        p_division_code,
        p_department_id || null,
        p_district_code || null,
        p_taluka_code || null,
      ]
    );

    console.log("DB ROWS:", result.rows.length);

    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error("getAvailableSlots error:", err);
    res.status(500).json({ error: "Failed to fetch slots" });
  }
};
