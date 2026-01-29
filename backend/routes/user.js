const express = require("express");
const router = express.Router();
const pool = require("../db");   // adjust path if needed

// 🔥 UNIFIED PROFILE API (ADMIN / OFFICER / HELPDESK)
router.get("/user/:entity_id", async (req, res) => {
  const { entity_id } = req.params;

  try {
    const result = await pool.query(
      "SELECT get_user_entity_by_id($1) AS data",
      [entity_id]
    );

    if (!result.rows.length || !result.rows[0].data) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    // result.rows[0].data already contains { role_code, data }
    return res.json({
      success: true,
      ...result.rows[0].data
    });

  } catch (err) {
    console.error("Profile API error:", err);
    res.status(500).json({
      success: false,
      message: "Server error while fetching profile",
    });
  }
});

module.exports = router;