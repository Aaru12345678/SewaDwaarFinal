const pool = require("../db"); // PostgreSQL pool
const bcrypt = require("bcrypt");
const { sendMail } = require('../helpers/sendMail');
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

// exports.insertOfficerSignup = async (req, res) => {
//   try {
//     // ✅ 1️⃣ First log — check raw incoming data from frontend
//     console.log("📩 Incoming signup request body:", req.body);
//     console.log("📸 Uploaded file info:", req.file);

//     const {
//       full_name,
//       mobile_no,
//       email_id,
//       password,
//       designation_code,
//       department_id,
//       organization_id,
//       state_code,
//       division_code,
//       district_code,
//       taluka_code,
//       role_code, // Admin / Officer / Helpdesk
//     } = req.body;

//     // ✅ Basic validation
//     if (!full_name || !password) {
//       return res.status(400).json({
//         success: false,
//         message: "Full name and password are required",
//       });
//     }

//     // ✅ 2️⃣ Log what role is being used for registration
//     console.log("🧩 Role being used:", role_code);

//     // ✅ Validate role_code
//     const roleCheck = await pool.query(
//       "SELECT 1 FROM m_role WHERE role_code = $1 AND is_active = TRUE",
//       [role_code || "OF"]
//     );
//     if (roleCheck.rowCount === 0) {
//       console.warn("⚠️ Invalid or inactive role:", role_code);
//       return res.status(400).json({
//         success: false,
//         message: "Invalid or inactive role code",
//       });
//     }

//     // ✅ Handle uploaded photo
//     const photo = req.file ? req.file.filename : null;

//     // ✅ 3️⃣ Log before password hashing
//     console.log("🔐 Preparing to hash password for user:", email_id || mobile_no);

//     // ✅ Hash password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // ✅ 4️⃣ Log the final payload to be passed into your DB function
//     console.log("📦 Final parameters for DB function:", {
//       hashedPassword,
//       full_name,
//       mobile_no,
//       email_id,
//       designation_code,
//       department_id,
//       organization_id,
//       state_code,
//       division_code,
//       district_code,
//       taluka_code,
//       photo,
//       role_code,
//     });

//     // ✅ Call generic user registration function
//     const result = await pool.query(
//       `SELECT * FROM public.register_user_by_role(
//         $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13
//       );`,
//       [
//         hashedPassword,                    // p_password_hash
//         full_name?.trim().slice(0, 255),   // p_full_name
//         mobile_no?.trim() || null,         // p_mobile_no
//         email_id?.trim() || null,          // p_email_id
//         designation_code || null,          // p_designation_code
//         department_id || null,             // p_department_id
//         organization_id || null,           // p_organization_id
//         state_code?.trim() || null,        // p_state_code
//         division_code?.trim() || null,     // p_division_code
//         district_code?.trim() || null,     // p_district_code
//         taluka_code?.trim() || null,       // p_taluka_code
//         photo?.trim() || null,             // p_photo
//         role_code?.trim() || "OF",         // p_role_code
//       ]
//     );

//     // ✅ 5️⃣ Log result coming back from PostgreSQL
//     console.log("🧾 DB function result:", result.rows);

//     const row = result.rows[0];
//     console.log(row,"row results")
//     const email=row.out_email_id
//     const officer_id=row.out_entity_id
//     const name=row.full_name
//     let entityId;
//     if (role_code === "OF") entityId = row.out_entity_id;
//     else if (role_code === "HD") entityId = row.out_entity_id;
//     else if (role_code === "AD") entityId = row.out_entity_id;

// try {
//       sendMail(email,"Welcome to SevaDwaar",`Hi, ${name} Thank you registering your officer id is ${officer_id}`)
      
//     } catch (emailError) {
//       console.error("Email sending failed:", emailError);
//     }

//     // ✅ Success response
//     if (row?.message?.toLowerCase().includes("success")) {
//       console.log("✅ Registration successful:", row);
//       return res.status(201).json({
//         success: true,
//         message: row.message,
//         user_id: row.out_user_id,
//         entity_id: entityId,
//         role: role_code?.trim() || "OF",
//       });
//     }

//     // ❌ Failure response from DB
//     console.warn("❌ Registration failed from DB:", row?.message);
//     return res.status(400).json({
//       success: false,
//       message: row?.message || "Failed to register user",
//     });

//   } catch (error) {
//     console.error("💥 Error in insertOfficerSignup:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to register user",
//       error: error.message,
//     });
//   }
// };

exports.insertOfficerSignup = async (req, res) => {
  try {
    console.log("📩 Incoming signup request body:", req.body);
    console.log("📸 Uploaded file info:", req.file);

    const {
      full_name,
      mobile_no,
      email_id,
      password,
      gender,
      designation_code,
      department_id,
      organization_id,

      officer_address,
      officer_state_code,
      officer_district_code,
      officer_division_code,
      officer_taluka_code,
      officer_pincode,

      role_code, // OF / HD / AD
    } = req.body;

    /* -------------------- BASIC VALIDATION -------------------- */
    if (!full_name || !password || !role_code) {
      return res.status(400).json({
        success: false,
        message: "Full name, password and role are required",
      });
    }

    /* -------------------- ROLE VALIDATION -------------------- */
    const roleCheck = await pool.query(
      `SELECT 1 FROM m_role 
       WHERE role_code = $1 AND is_active = TRUE`,
      [role_code]
    );

    if (roleCheck.rowCount === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid or inactive role code",
      });
    }

    /* -------------------- PHOTO -------------------- */
    const photo = req.file ? req.file.filename : null;

    /* -------------------- PASSWORD HASH -------------------- */
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log("📦 Parameters passed to DB function:", {
      full_name,
      mobile_no,
      email_id,
      gender,
      designation_code,
      department_id,
      organization_id,
      officer_address,
      officer_state_code,
      officer_district_code,
      officer_division_code,
      officer_taluka_code,
      officer_pincode,
      photo,
      role_code,
    });

    /* -------------------- DB FUNCTION CALL -------------------- */
    const result = await pool.query(
      `SELECT * FROM public.register_user_by_role(
        $1,$2,$3,$4,$5,$6,$7,$8,
        $9,$10,$11,$12,$13,$14,
        $15,$16
      );`,
      [
        hashedPassword,                  // 1 p_password_hash
        full_name.trim().slice(0, 255),  // 2 p_full_name
        mobile_no?.trim() || null,       // 3 p_mobile_no
        email_id?.trim() || null,        // 4 p_email_id
        gender || null,                  // 5 p_gender
        designation_code || null,        // 6 p_designation_code
        department_id || null,           // 7 p_department_id
        organization_id || null,         // 8 p_organization_id

        officer_address || null,         // 9 p_officer_address
        officer_state_code || null,      // 10 p_officer_state_code
        officer_district_code || null,   // 11 p_officer_district_code
        officer_division_code || null,   // 12 p_officer_division_code
        officer_taluka_code || null,     // 13 p_officer_taluka_code
        officer_pincode || null,         // 14 p_officer_pincode

        photo || null,                   // 15 p_photo
        role_code,                       // 16 p_role_code
      ]
    );

    const row = result.rows[0];
    console.log("🧾 DB function result:", row);

    /* -------------------- EMAIL (OPTIONAL) -------------------- */
    if (row?.out_email_id) {
      try {
        await sendMail(
          row.out_email_id,
          "Welcome to SevaDwaar",
          `Hi ${row.full_name},\n\nYour registration was successful.\nYour ID: ${row.out_entity_id}`
        );
      } catch (err) {
        console.error("📧 Email failed:", err.message);
      }
    }

    /* -------------------- FINAL RESPONSE -------------------- */
    if (row?.message?.toLowerCase().includes("success")) {
      return res.status(201).json({
        success: true,
        message: row.message,
        user_id: row.out_user_id,
        entity_id: row.out_entity_id,
        role: role_code,
      });
    }

    return res.status(400).json({
      success: false,
      message: row?.message || "User registration failed",
    });

  } catch (error) {
    console.error("💥 insertOfficerSignup error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};






exports.loginOfficer = async (req, res) => {
  const { username, password } = req.body;
  console.log("🟢 Received username:", username);

  try {
    // ✅ Explicit schema + correct function name
    const result = await pool.query("SELECT * FROM public.get_user_by_username2($1);", [username]);
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
    });
  } catch (error) {
    console.error("❌ Officer login error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};




// exports.loginOfficer = async (req, res) => {
//   const { username, password } = req.body;

//   try {
//     const result = await pool.query("SELECT * FROM get_user_by_username2($1);", [username]);
//     const officer = result.rows[0];
//     // 1️⃣ Check if officer exists
//     if (!officer) {
//       return res.status(404).json({
//         success: false,
//         message: "Officer username not found",
//       });
//     }

//     // 2️⃣ Check if account is active
//     if (!officer.out_is_active) {
//       return res.status(403).json({
//         success: false,
//         message: "Account is inactive",
//       });
//     }

//     // 3️⃣ Verify password (plain text)
//     const isMatch = await bcrypt.compare(password, officer.out_password_hash);
//     console.log(isMatch)  
//     if (!isMatch) {
//           return res.status(401).json({
//             success: false,
//             message: "Invalid password",
//           });
//         }

//     // ✅ Success
//     res.status(200).json({
//       success: true,
//       message: "Login successful",
//       user_id: officer.out_user_id,
//       officer_id: officer.out_officer_id, // make sure this column exists in DB
//       // username: officer.out_username,
//       role: officer.out_role_code,
//     });
//   } catch (error) {
//     console.error("❌ Officer login error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error",
//       error: error.message,
//     });
//   }
// };
// 

exports.getOfficersByLocation = async (req, res) => {
  try {
    let {
      state_code,
      division_code,
      organization_id,
      district_code,
      taluka_code,
      department_id
    } = req.body;

    // 🚨 Mandatory validation
    if (!state_code || !division_code || !organization_id) {
      return res.status(400).json({
        success: false,
        message: "state_code, division_code and organization_id are required"
      });
    }

    // ✅ Convert empty strings to NULL
    district_code = district_code || null;
    taluka_code = taluka_code || null;
    department_id = department_id || null;
    

    // 🚨 Mandatory validation
    
    // ✅ Convert empty strings to NULL
    

    const query = `
      SELECT * FROM get_officers_same_location($1, $2, $3, $4, $5, $6);
    `;

    const values = [
      state_code,
      division_code,
      organization_id,
      district_code,
      taluka_code,
      department_id
    ];

    
    console.log("📤 SQL Params:", values);

    const result = await pool.query(query, values);

    // ✅ Custom popup message when no officers found
    if (result.rows.length === 0) {
      return res.status(200).json({
        success: false,
        message: "No officer available. Helpdesk will handle your appointment.",
        data: []
      });
    }

    return res.status(200).json({
      success: true,
      message: "Officers fetched successfully",
      data: result.rows
      
    });


  } catch (error) {
    console.error("❌ Error fetching officers by location:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching officers",
      error: error.message
    });
  }
};

// Get Officer Dashboard Data
exports.getOfficerDashboard = async (req, res) => {
  try {
    const { officer_id } = req.params;

    if (!officer_id) {
      return res.status(400).json({
        success: false,
        message: "Officer ID is required",
      });
    }

    const { rows } = await pool.query(
      "SELECT get_officer_dashboard_by_username($1) AS dashboard",
      [officer_id]
    );

    return res.status(200).json({
      success: true,
      data: rows[0].dashboard,
    });

  } catch (error) {
    console.error("❌ Dashboard error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching dashboard",
    });
  }
};


// Update appointment status (approve, reject, complete)
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { appointment_id, status, officer_id, reason } = req.body;

    const { rows } = await pool.query(
      `SELECT update_appointment_status($1, $2, $3, $4) AS result`,
      [appointment_id, status, officer_id, reason]
    );

    const result = rows[0].result;

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);

  } catch (error) {
    console.error("❌ Error updating appointment status:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating appointment",
    });
  }
};


// Reschedule appointment
exports.rescheduleAppointment = async (req, res) => {
  try {
    const { appointment_id, officer_id, new_date, new_time, reason } = req.body;

    const { rows } = await pool.query(
      "SELECT reschedule_appointment($1, $2, $3, $4, $5) AS result",
      [appointment_id, officer_id, new_date, new_time, reason]
    );

    return res.status(200).json(rows[0].result);

  } catch (error) {
    console.error("❌ Error rescheduling appointment:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while rescheduling appointment",
    });
  }
};


// Get appointments by specific date for reports/downloads
exports.getAppointmentsByDate = async (req, res) => {
  try {
    const { officer_id } = req.params;
    const { date } = req.query;
    // console.log(officer_id,"officer_id")
    // console.log(date,"date")

    const { rows } = await pool.query(
      "SELECT get_appointments_by_date($1, $2) AS result",
      [officer_id, date]
    );
   
    return res.status(200).json(rows[0].result);

  } catch (error) {
    console.error("❌ Error fetching appointments by date:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching appointments",
    });
  }
};


// Get report data for officer
exports.getOfficerReports = async (req, res) => {
  try {
    const { officer_id } = req.params;
    const { type, month, start, end } = req.query;

    const { rows } = await pool.query(
      `SELECT get_officer_reports($1, $2, $3, $4, $5) AS result`,
      [officer_id, type, month, start, end]
    );

    res.status(200).json(rows[0].result);
  } catch (err) {
    console.error("❌ Report error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};