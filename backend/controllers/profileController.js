const pool = require("../db");    // 🔥 VERY IMPORTANT
const jwt = require("jsonwebtoken");

exports.getMyProfile = async (req, res) => {
  try {
    const role_code = req.user.role_code;   // from JWT
    const { admin_id, officer_id, helpdesk_id } = req.user;

    let profileData;

    // ================= ADMIN =================
    if (role_code === "AD") {
      if (!admin_id) {
        return res.status(400).json({
          success: false,
          message: "Admin ID missing in token",
        });
      }

      const result = await pool.query(
        "SELECT * FROM get_admin_details_by_id($1)",
        [admin_id]
      );

      profileData = result.rows[0];
    }

    // ================= OFFICER =================
    else if (role_code === "OF") {
      if (!officer_id) {
        return res.status(400).json({
          success: false,
          message: "Officer ID missing in token",
        });
      }

      const result = await pool.query(
        "SELECT * FROM get_officer_details_by_id($1)",
        [officer_id]
      );

      profileData = result.rows[0];
    }

    // ================= HELPDESK =================
    else if (role_code === "HD") {
      if (!helpdesk_id) {
        return res.status(400).json({
          success: false,
          message: "Helpdesk ID missing in token",
        });
      }

      const result = await pool.query(
        "SELECT * FROM get_helpdesk_details_by_id($1)",
        [helpdesk_id]
      );

      profileData = result.rows[0];
    }

    // ================= INVALID ROLE =================
    else {
      console.log("❌ Invalid role in token:", role_code);
      return res.status(403).json({
        success: false,
        message: "Invalid role",
      });
    }

    if (!profileData) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    return res.json({
      success: true,
      data: profileData,
    });

  } catch (err) {
    console.error("❌ Profile fetch error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error fetching profile",
      error: err.message,
    });
  }
};