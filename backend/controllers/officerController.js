const pool = require("../db"); // PostgreSQL pool
const bcrypt = require("bcrypt");

exports.insertOfficerSignup = async (req, res) => {
  try {
    const {
      full_name,
      mobile_no,
      email_id,
      password,
      designation_code,
      department_id,
      organization_id,
      state_code,
      division_code,
      district_code,
      taluka_code,
    } = req.body;

    // Basic validation
    if (!full_name || !password) {
      return res.status(400).json({
        success: false,
        message: "Full name and password are required",
      });
    }

    // Handle uploaded photo (via multer)
    const photo = req.file ? req.file.filename : null;

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Call PostgreSQL function (12 params)
    const result = await pool.query(
      `SELECT * FROM public.register_officer(
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12
      );`,
      [
        hashedPassword,                    // p_password_hash
        full_name?.trim().slice(0, 255),   // p_full_name
        mobile_no?.trim() || null,         // p_mobile_no
        email_id?.trim() || null,          // p_email_id
        designation_code || null,          // p_designation_code
        department_id || null,             // p_department_id
        organization_id || null,           // p_organization_id
        state_code?.trim() || null,        // p_state_code
        division_code?.trim() || null,     // p_division_code
        district_code?.trim() || null,     // p_district_code
        taluka_code?.trim() || null,       // p_taluka_code
        photo?.trim() || null              // p_photo
      ]
    );

     const row = result.rows[0];

    // ✅ Accept success message from DB properly
    if (row?.message?.toLowerCase().includes("success")) {
      return res.status(201).json({
        success: true,
        message: row.message,
        user_id: row.user_id,
        officer_id: row.officer_id,
      });
    }

    // ❌ Handle DB rejection (duplicate, etc.)
    return res.status(400).json({
      success: false,
      message: row?.message || "Failed to register officer",
    });

  } catch (error) {
    console.error("❌ Error in insertOfficerSignup:", error);
    res.status(500).json({
      success: false,
      message: "Failed to register officer",
      error: error.message,
    });
  }
};


exports.loginOfficer = async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await pool.query("SELECT * FROM get_user_by_username($1);", [username]);
    const officer = result.rows[0]; // use officer
 console.log(officer,"OFF003")
    // 1️⃣ Check if officer exists
    if (!officer) {
      return res.status(404).json({
        success: false,
        message: "Officer username not found",
      });
    }

    // 2️⃣ Check if account is active
    if (!officer.out_is_active) {
      return res.status(403).json({
        success: false,
        message: "Account is inactive",
      });
    }

    // 3️⃣ Verify password (plain text)
    const isMatch = await bcrypt.compare(password, officer.out_password_hash);
    console.log(isMatch)  
    if (!isMatch) {
          return res.status(401).json({
            success: false,
            message: "Invalid password",
          });
        }

    // ✅ Success
    res.status(200).json({
      success: true,
      message: "Login successful",
      user_id: officer.out_user_id,
      officer_id: officer.out_officer_id, // make sure this column exists in DB
      // username: officer.out_username,
      role: officer.out_role_code,
    });
  } catch (error) {
    console.error("❌ Officer login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
