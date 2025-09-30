const pool = require('../db');
require("dotenv").config(); // Ensure JWT_SECRET is loaded

const bcrypt = require("bcrypt");

exports.insertVisitorSignup = async (req, res) => {
  try {
    const {
      user_id,
      full_name,
      gender,
      dob,
      mobile_no,
      email_id,
      state_code,
      division_code,
      district_code,
      taluka_code,
      pincode,
      password,
      photo,
      insert_by,
      insert_ip
    } = req.body;

    // 1️⃣ Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 2️⃣ Insert into m_users first (to satisfy FK)
    await pool.query(
      `INSERT INTO m_users (user_id, username, password_hash, role_code, is_active, insert_ip, insert_by)
       VALUES ($1,$2,$3,$4,TRUE,$5,$6)
       ON CONFLICT (user_id) DO NOTHING`,
      [
        user_id?.slice(0, 20),              // email as user_id
        full_name?.slice(0, 100),           // username
        hashedPassword,                     // password_hash
        "VS",                               // role_code → define "VS" (Visitor) in m_role
        insert_ip?.slice(0, 50) || "NA",    // insert_ip
        insert_by?.slice(0, 100) || "system"// insert_by
      ]
    );

    // 3️⃣ Call the Postgres signup function
    const result = await pool.query(
      `SELECT public.signup(
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15
      ) AS visitor_id`,
      [
        user_id?.slice(0, 20),
        full_name?.slice(0, 255),
        gender?.charAt(0),
        dob || null,
        mobile_no?.slice(0, 15),
        email_id?.slice(0, 255),
        state_code?.slice(0, 2) || null,
        pincode?.slice(0, 10) || null,
        hashedPassword,                     // store same hash in visitor table
        photo?.slice(0, 500) || "",
        division_code?.slice(0, 5) || null,
        district_code?.slice(0, 5) || null,
        taluka_code?.slice(0, 5) || null,
        insert_by?.slice(0, 100) || "system",
        insert_ip?.slice(0, 50) || "NA"
      ]
    );

    res.status(201).json({
      success: true,
      message: "Visitor signed up successfully",
      visitor_id: result.rows[0].visitor_id,
    });

  } catch (error) {
    console.error("Error in insertVisitorSignup:", error);
    res.status(500).json({
      success: false,
      message: "Failed to signup visitor",
      error: error.message,
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email_id, mobile_no, password } = req.body;

    if ((!email_id && !mobile_no) || !password) {
      return res.status(400).json({
        success: false,
        message: "Email or Mobile and password are required",
      });
    }

    // 1️⃣ Fetch user (by email_id OR mobile_no)
    const query = `
      SELECT u.user_id, u.user_id AS email_id, u.password_hash, u.role_code, u.is_active, v.mobile_no
      FROM m_users u
      LEFT JOIN m_visitors_signup v ON u.user_id = v.user_id
      WHERE (u.user_id = $1 OR v.mobile_no = $2)
      LIMIT 1;
    `;

    const { rows } = await pool.query(query, [email_id || null, mobile_no || null]);

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or mobile number",
      });
    }

    const user = rows[0];

    // 2️⃣ Verify password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({
        success: false,
        message: "Invalid password",
      });
    }

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: "Account is deactivated. Please contact admin.",
      });
    }

    // 3️⃣ Respond with user info (omit password_hash)
    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        user_id: user.user_id,
        email_id: user.email_id,
        mobile_no: user.mobile_no,
        role_code: user.role_code,
      },
    });

  } catch (error) {
    console.error("Error in login:", error);
    res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message,
    });
  }
};
