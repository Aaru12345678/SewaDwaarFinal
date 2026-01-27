const pool = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const generateToken = (user) => {
  return jwt.sign(
    {
      user_id: user.out_user_id,
      username: user.out_username,
      role: user.out_role_code,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
  );
};

// Login helpdesk user
const loginHelpdesk = async (req, res) => {
  const { username, password } = req.body;
  // try {
  //   // Query m_users table for helpdesk user
  //   const userRes = await pool.query(
  //     "SELECT user_id, username, password_hash, role_code FROM m_users WHERE username = $1 AND role_code = 'HD'",
  //     [username]
  //   );

  //   if (userRes.rows.length === 0) {
  //     return res.status(401).json({ message: "Invalid username or password" });
  //   }
  //   const user = userRes.rows[0];

  //   const isValid = await bcrypt.compare(password, user.password_hash);
  //   if (!isValid) {
  //     return res.status(401).json({ message: "Invalid username or password" });
  //   }

  //   res.json({
  //     message: "Login successful",
  //     helpdesk_id: user.user_id,
  //     username: user.username,
  //     role_code: user.role_code,
  //   });
  // } catch (error) {
  //   console.error("Helpdesk login error:", error);
  //   res.status(500).json({ message: "Server error" });
  // }


  try {
    // ✅ Explicit schema + correct function name
    const result = await pool.query("SELECT * FROM public.get_user_by_usernameHelpdesk($1);", [username]);
    console.log("🟢 Query result:", result.rows);

    const officer = result.rows[0];
    if (!officer) {
      return res.status(404).json({ success: false, message: "Officer username not found" });
    }

    if (!officer.out_is_active) {
      return res.status(403).json({ success: false, message: "Account is inactive" });
    }

    const isMatch = await bcrypt.compare(password, officer.out_password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid password" });
    }

    const token = generateToken(officer);


    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user_id: officer.out_user_id,
      officer_id: officer.out_officer_id,
      username: officer.out_username,
      role: officer.out_role_code,
      organization: officer.out_organization_id,
      state:officer.out_state_code,
      division:officer.out_division_code,
      district:officer.out_district_code,
      taluka:officer.out_taluka_code,
    });
  } catch (error) {
    console.error("❌ Officer login error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};


// Get helpdesk dashboard data
const getHelpdeskDashboard = async (req, res) => {
  try {
    const { state, district, division, taluka, date } = req.query;

    // state is mandatory
    if (!state) {
      return res.status(400).json({
        success: false,
        message: "state is required"
      });
    }

    const pDate = date || new Date().toISOString().split("T")[0];

    const result = await pool.query(
      `SELECT get_helpdesk_dashboard($1, $2, $3, $4, $5)::json AS result`,
      [
        state,
        district || null,
        division || null,
        taluka || null,
        pDate
      ]
    );

    const output =
      result.rows[0]?.result ||
      { success: false, message: "No data found" };
    console.log(output,"output")
    return res.json(output);

  } catch (error) {
    console.error("Get helpdesk dashboard error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};


// Register/Create helpdesk user
const registerHelpdesk = async (req, res) => {
  const { username, password, full_name, email, phone, location_id } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      "SELECT register_helpdesk($1,$2,$3,$4,$5,$6)::json AS result",
      [username, hashedPassword, full_name, email, phone, location_id || null]
    );
    const out = result.rows[0].result;
    if (out.success) {
      return res.status(201).json(out);
    } else {
      return res.status(400).json(out);
    }
  } catch (error) {
    console.error("Register helpdesk error:", error);
    res.status(500).json({ message: "Server error" });
  }
};



// Book walk-in appointment from helpdesk
const bookWalkinAppointment = async (req, res) => {
  const {
    visitor_name, visitor_phone, visitor_email, visitor_aadhar, visitor_address,
    organization_id, department_id, officer_id, appointment_date,
    slot_time, purpose, booked_by, insert_by
  } = req.body;

  console.log("📝 Book Walkin Request Received:", {
    visitor_name,
    visitor_phone,
    organization_id,
    department_id,
    officer_id,
    appointment_date,
    slot_time
  });

  try {
    // Validate required fields
    if (!visitor_name || !visitor_phone || !organization_id || !department_id || !officer_id || !appointment_date || !slot_time) {
      console.error("❌ Validation failed - Missing required fields");
      return res.status(400).json({
        success: false,
        message: "Missing required fields: visitor_name, visitor_phone, organization_id, department_id, officer_id, appointment_date, slot_time"
      });
    }

    console.log("📝 Inserting into walkins table...");

    // Insert directly into walkins table
    const walkinQuery = `
      INSERT INTO walkins (
        full_name, mobile_no, email_id,
        organization_id, department_id, officer_id,
        appointment_date, time_slot, purpose,
        is_walkin, status, booked_by, insert_date, insert_by, insert_ip
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true, 'pending', $10, NOW(), $11, '127.0.0.1')
      RETURNING walkin_id
    `;

    const walkinRes = await pool.query(walkinQuery, [
      visitor_name,
      visitor_phone,
      visitor_email || null,
      organization_id,
      department_id,
      officer_id,
      appointment_date,
      slot_time,
      purpose || null,
      booked_by || "helpdesk",
      insert_by || "helpdesk"
    ]);

    const walkin_id = walkinRes.rows[0]?.walkin_id;

    if (!walkin_id) {
      console.error("❌ Failed to create walk-in appointment - no ID returned");
      return res.status(400).json({
        success: false,
        message: "Failed to create walk-in appointment"
      });
    }

    console.log("✅ Walk-in appointment created successfully with ID:", walkin_id);

    return res.status(201).json({
      success: true,
      walkin_id,
      appointment_id: `WLK-${walkin_id}`,
      visitor_name,
      visitor_phone,
      appointment_date,
      slot_time,
      message: "Walk-in appointment booked successfully"
    });
  } catch (error) {
    console.error("❌ Book walk-in error:", error.message);
    console.error("Error Details:", error);
    
    res.status(500).json({ 
      success: false, 
      message: "Server error: " + error.message,
      error: error.detail || error.message,
      code: error.code
    });
  }
};


// Get officers by organization and department (for helpdesk booking)
const getOfficersForBooking = async (req, res) => {
  const { organization_id, department_id } = req.body;

  if (!organization_id || !department_id) {
    return res.status(400).json({
      success: false,
      message: "organization_id and department_id are required",
    });
  }

  try {
    const result = await pool.query(
      "SELECT get_officers_for_booking_function($1, $2) AS data",
      [organization_id, department_id]
    );

    res.json({
      success: true,
      data: result.rows[0].data, // already JSON array
    });
  } catch (error) {
    console.error("❌ getOfficersForBooking:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching officers",
      error: error.message,
    });
  }
};

// Get all appointments grouped by department (read-only view for helpdesk)
// GET /api/helpdesk/appointments-by-department?date=YYYY-MM-DD
const getAllAppointmentsByDepartment = async (req, res) => {
  const { date } = req.query;

  const queryDate = date || new Date().toISOString().split("T")[0];

  try {
    const result = await pool.query(
      "SELECT get_all_appointments_by_department_function($1) AS data",
      [queryDate]
    );

    res.json(result.rows[0].data); // already { success, departments, appointments }
  } catch (error) {
    console.error("❌ getAllAppointmentsByDepartment:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching appointments",
      error: error.message,
    });
  }
};


// Get notifications for helpdesk user
// GET /api/helpdesk/notifications?location_id=XXX
const getNotifications = async (req, res) => {
  const { location_id } = req.query;

  try {
    const result = await pool.query(
      "SELECT get_helpdesk_notifications($1) AS data",
      [location_id || null]
    );

    res.json({
      success: true,
      notifications: result.rows[0].data, // JSON array
    });
  } catch (error) {
    console.error("❌ getNotifications:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching notifications",
      error: error.message,
    });
  }
};


// Mark notification as read
const markNotificationAsRead = async (req, res) => {
  try {
    // For now, this is a placeholder as we're not storing notifications in DB
    // In a real implementation, you'd update a notifications table
    res.json({ success: true, message: "Notification marked as read" });
  } catch (error) {
    console.error("Mark notification as read error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Delete notification
const deleteNotification = async (req, res) => {
  try {
    res.json({ success: true, message: "Notification deleted" });
  } catch (error) {
    console.error("Delete notification error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
// controllers/officerController.js
// const { pool } = require('../db'); // adjust path to your pg pool export

// GET /helpdesks/:helpdesk_id/officers/availability?location_id=&date=YYYY-MM-DD
const getOfficerAvailability = async (req, res) => {
  const { helpdesk_id } = req.params;
  const { date } = req.query;

  try {
    // Validate helpdesk_id
    if (!helpdesk_id) {
      return res.status(400).json({
        success: false,
        message: 'helpdesk_id is required'
      });
    }

    // If date is empty string or undefined → pass NULL
    const appointmentDate =
      date && date.trim() !== '' ? date : null;

    const result = await pool.query(
      `SELECT * FROM public.get_officer_availability($1, $2)`,
      [helpdesk_id, appointmentDate]
    );

    // Function defaults to CURRENT_DATE if NULL
    const usedDate =
      appointmentDate || new Date().toISOString().split('T')[0];

    res.status(200).json({
      success: true,
      helpdesk_id,
      date: usedDate,
      officers: result.rows
    });
  } catch (error) {
    console.error('Get officer availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const getUserByMobileNo = async (req, res) => {
  const { mobile_no } = req.params;

  try {
    // Basic validation
    if (!mobile_no) {
      return res.status(400).json({
        success: false,
        message: 'Mobile number is required'
      });
    }

    const { rows } = await pool.query(
      `SELECT public.get_user_by_mobile_no($1) AS user`,
      [mobile_no]
    );

    const userData = rows[0]?.user;

    // No user found
    if (!userData || Object.keys(userData).length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: userData
    });
  } catch (error) {
    console.error('Get user by mobile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const getVisitorDetails = async (req, res) => {
  try {
    const { visitor_id, mobile_no, email_id } = req.query;

    if (!visitor_id && !mobile_no && !email_id) {
      return res.status(400).json({
        success: false,
        message: "visitor_id or mobile_no or email_id is required"
      });
    }

    const { rows } = await pool.query(
      `SELECT get_visitor_details($1, $2, $3) AS result`,
      [visitor_id || null, mobile_no || null, email_id || null]
    );

    const response = rows[0]?.result;

    if (!response || response.status === "error") {
      return res.status(404).json({
        success: false,
        message: "Visitor not found"
      });
    }

    return res.status(200).json({
      success: true,
      data: response.data
    });

  } catch (error) {
    console.error("Error fetching visitor details:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};


// get helpdesk info counts:today,pending,rejected,reschduled:
const getHelpdeskDashboardCounts = async (req, res) => {
  try {
    const { helpdesk_id } = req.params;

    if (!helpdesk_id) {
      return res.status(400).json({
        success: false,
        message: 'helpdesk_id is required'
      });
    }

    const query = `
      SELECT get_helpdesk_dashboard_counts($1) AS dashboard;
    `;

    const { rows } = await pool.query(query, [helpdesk_id]);

    if (!rows.length || !rows[0].dashboard) {
      return res.status(404).json({
        success: false,
        message: 'Dashboard data not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: rows[0].dashboard
    });

  } catch (error) {
    console.error('Error fetching helpdesk dashboard:', error);

    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// module.exports = {
//   getUserByMobileNo
// };


// module.exports = { getOfficerAvailability };


module.exports = {
  loginHelpdesk,
  getHelpdeskDashboard,
  registerHelpdesk,
  bookWalkinAppointment,
  getOfficersForBooking,
  getAllAppointmentsByDepartment,
  getNotifications,
  markNotificationAsRead,
  deleteNotification,
  getOfficerAvailability,
  getUserByMobileNo,
  getVisitorDetails,
  getHelpdeskDashboardCounts
};
