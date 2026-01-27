const pool = require('../db'); // Your PostgreSQL pool
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt"); // ⭐ NEW
// const multer = require("multer");
// Folder to save uploaded photos
// const UPLOAD_DIR = path.join(__dirname, "../uploads/visitors");
// if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// // Max size ~200 KB (govt guideline)
// const upload = multer({
//   storage: multer.diskStorage({
//     destination: function (req, file, cb) {
//       cb(null, UPLOAD_DIR);
//     },
//     filename: function (req, file, cb) {
//       const ext = path.extname(file.originalname);
//       const filename = `${Date.now()}_${Math.round(Math.random() * 1e9)}${ext}`;
//       cb(null, filename);
//     },
//   }),
//   limits: { fileSize: 200 * 1024 }, // 200 KB
//   fileFilter: (req, file, cb) => {
//     const allowed = ["image/jpeg", "image/jpg", "image/png"];
//     if (allowed.includes(file.mimetype)) cb(null, true);
//     else cb(new Error("Only JPG, JPEG, PNG files are allowed"));
//   },
// }).single("photo");

// Get dashboard data for a visitor
exports.getVisitorDashboard = async (req, res) => {
  try {
    const username = req.params.username; // From route: /api/visitor/:username/dashboard

    if (!username) {
      return res.status(400).json({ success: false, message: "username is required" });
    }

    const result = await pool.query(
      `SELECT get_visitor_dashboard_by_username($1) AS data;`,
      [username]
    );
    
    const dashboardData = result.rows[0].data;
     console.log(dashboardData,"dataaaaa")
    res.status(200).json({
      success: true,
      data: dashboardData
    });

  } catch (error) {
    console.error("Error fetching visitor dashboard:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};


exports.getVisitorProfile = async (req, res) => {
  try {
    const { visitor_id } = req.params; // /api/visitor/:visitor_id

    console.log(visitor_id, "visitor_id");

    const result = await pool.query(
      "SELECT * FROM get_visitor_details_by_id($1);",
      [visitor_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Visitor not found"
      });
    }

    console.log(result.rows[0], "resultProfile");

    return res.status(200).json({
      success: true,
      data: result.rows[0]   // ✅ full visitor object
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.updateVisitorProfile = async (req, res) => {
  try {
    console.log("BODY:", req.body);   // debug
    console.log("FILE:", req.file);   // debug

    const { visitor_id } = req.params;
    if (!visitor_id) {
      return res.status(400).json({
        success: false,
        message: "visitor_id is required"
      });
    }

    const {
      full_name,
      gender,
      dob,
      mobile_no,
      email_id,
      state_code,
      division_code,
      district_code,
      taluka_code,
      pincode
    } = req.body;

    // Optional photo (multer)
    const photo = req.file ? req.file.filename : null;

    const query = `
      SELECT * FROM update_visitor_by_id(
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12
      )
    `;

    const values = [
      visitor_id,
      full_name || null,
      gender || null,          // CHAR
      dob || null,             // DATE (YYYY-MM-DD)
      mobile_no || null,
      email_id || null,
      state_code || null,
      division_code || null,
      district_code || null,
      taluka_code || null,
      pincode || null,
      photo
    ];

    const result = await pool.query(query, values);

    return res.status(200).json({
      success: true,
      message: "Visitor profile updated successfully",
      data: result.rows[0]   // function returns table
    });

  } catch (error) {
    console.error("updateVisitorProfile error:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.changePassword = async (req, res) => {
  const { user_id, old_password, new_password } = req.body;

  try {
    // 1️⃣ Fetch the user
    const userRes = await pool.query(
      "SELECT password_hash FROM m_users WHERE user_id = $1",
      [user_id]
    );

    if (!userRes.rows.length) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // 2️⃣ Compare old password
    const isMatch = await bcrypt.compare(
      old_password,
      userRes.rows[0].password_hash
    );

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Old password is incorrect",
      });
    }

    // 3️⃣ Hash new password
    const hashedNewPassword = await bcrypt.hash(new_password, 10);

    // 4️⃣ Call PostgreSQL function that now returns is_first_login
    const result = await pool.query(
      "SELECT * FROM change_user_password($1, $2)",
      [user_id, hashedNewPassword]
    );

    if (result.rows.length) {
      // 5️⃣ Return success, message, and updated is_first_login
      return res.json(result.rows[0]);
    } else {
      return res.status(500).json({
        success: false,
        message: "Password update failed",
        is_first_login: null
      });
    }

  } catch (err) {
    console.error("Change password error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
      is_first_login: null
    });
  }
};

exports.getUnreadNotificationCount = async (req, res) => {
  const { username } = req.query;

  const result = await pool.query(
    `SELECT COUNT(*) AS unread_count
     FROM notifications
     WHERE username = $1 AND is_read = false`,
    [username]
  );

  res.json({ unreadCount: Number(result.rows[0].unread_count) });
};

exports.markNotificationsAsRead = async (req, res) => {
  try {
    const username = req.user?.username; // ✅ FROM TOKEN

    if (!username) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    await pool.query(
      `UPDATE notifications
       SET is_read = true
       WHERE username = $1 AND is_read = false`,
      [username]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("markNotificationsAsRead error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
