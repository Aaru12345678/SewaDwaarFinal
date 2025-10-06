const pool = require('../db');
require("dotenv").config(); // Ensure JWT_SECRET is loaded

const bcrypt = require("bcrypt");

// exports.insertVisitorSignup = async (req, res) => {
//   try {
//     const {
//       user_id,
//       full_name,
//       gender,
//       dob,
//       mobile_no,
//       email_id,
//       state_code,
//       division_code,
//       district_code,
//       taluka_code,
//       pincode,
//       password,
//       photo,
//       insert_by,
//       insert_ip
//     } = req.body;

//     // 1️⃣ Hash the password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // 2️⃣ Insert into m_users first (to satisfy FK)
//     await pool.query(
//       `INSERT INTO m_users (user_id, username, password_hash, role_code, is_active, insert_ip, insert_by)
//        VALUES ($1,$2,$3,$4,TRUE,$5,$6)
//        ON CONFLICT (user_id) DO NOTHING`,
//       [
//         user_id?.slice(0, 20),              // email as user_id
//         full_name?.slice(0, 100),           // username
//         hashedPassword,                     // password_hash
//         "VS",                               // role_code → define "VS" (Visitor) in m_role
//         insert_ip?.slice(0, 50) || "NA",    // insert_ip
//         insert_by?.slice(0, 100) || "system"// insert_by
//       ]
//     );

//     // 3️⃣ Call the Postgres signup function
//     const result = await pool.query(
//       `SELECT public.signup(
//         $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15
//       ) AS visitor_id`,
//       [
//         user_id?.slice(0, 20),
//         full_name?.slice(0, 255),
//         gender?.charAt(0),
//         dob || null,
//         mobile_no?.slice(0, 15),
//         email_id?.slice(0, 255),
//         state_code?.slice(0, 2) || null,
//         pincode?.slice(0, 10) || null,
//         hashedPassword,                     // store same hash in visitor table
//         photo?.slice(0, 500) || "",
//         division_code?.slice(0, 5) || null,
//         district_code?.slice(0, 5) || null,
//         taluka_code?.slice(0, 5) || null,
//         insert_by?.slice(0, 100) || "system",
//         insert_ip?.slice(0, 50) || "NA"
//       ]
//     );

//     res.status(201).json({
//       success: true,
//       message: "Visitor signed up successfully",
//       visitor_id: result.rows[0].visitor_id,
//     });

//   } catch (error) {
//     console.error("Error in insertVisitorSignup:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to signup visitor",
//       error: error.message,
//     });
//   }
// };

const path = require("path");
const fs = require("fs");

// Multer setup for photo upload
const multer = require("multer");

// Folder to save uploaded photos
const UPLOAD_DIR = path.join(__dirname, "../uploads/visitors");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// Max size ~200 KB (govt guideline)
const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, UPLOAD_DIR);
    },
    filename: function (req, file, cb) {
      const ext = path.extname(file.originalname);
      const filename = `${Date.now()}_${Math.round(Math.random() * 1e9)}${ext}`;
      cb(null, filename);
    },
  }),
  limits: { fileSize: 200 * 1024 }, // 200 KB
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/jpg", "image/png"];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Only JPG, JPEG, PNG files are allowed"));
  },
}).single("photo");

// exports.insertVisitorSignup = async (req, res) => {
//   upload(req, res, async (err) => {
//     if (err) {
//       return res.status(400).json({ success: false, message: err.message });
//     }

//     try {
//       const {
//         full_name,
//         gender,
//         dob,
//         mobile_no,
//         email_id,
//         state_code,
//         division_code,
//         district_code,
//         taluka_code,
//         pincode,
//         password,
//         insert_by,
//         insert_ip,
//       } = req.body;

//       if (!full_name || !email_id || !password) {
//         return res.status(400).json({ success: false, message: "Full name, email, and password are required" });
//       }

//       const hashedPassword = await bcrypt.hash(password, 10);

//       // Save file path instead of Base64
//       const photoPath = req.file ? `/uploads/visitors/${req.file.filename}` : null;

//       // Call your PL/pgSQL function
//       const result = await pool.query(
//         `SELECT * FROM register_visitor($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
//         [
//           email_id?.slice(0, 255),     // username
//           hashedPassword,
//           full_name?.slice(0, 255),
//           gender?.charAt(0) || null,
//           dob || null,
//           mobile_no?.slice(0, 15) || null,
//           email_id?.slice(0, 255),
//           state_code?.slice(0, 2) || null,
//           division_code?.slice(0, 5) || null,
//           district_code?.slice(0, 5) || null,
//           taluka_code?.slice(0, 5) || null,
//           pincode?.slice(0, 10) || null,
//           photoPath
//         ]
//       );

//       const row = result.rows[0];

//       if (row.message !== "Registration successful") {
//         return res.status(400).json({ success: false, message: row.message });
//       }

//       res.status(201).json({
//         success: true,
//         message: "Visitor signed up successfully",
//         user_id: row.user_id,
//         visitor_id: row.visitor_id,
//       });

//     } catch (error) {
//       console.error("Error in insertVisitorSignup:", error);
//       res.status(500).json({ success: false, message: "Failed to signup visitor", error: error.message });
//     }
//   });
// };

// exports.insertVisitorSignup = async (req, res) => {
//   try {
//     // Destructure from req.body (matches frontend FormData)
//     const {
//       full_name,
//       email_id,
//       mobile_no,
//       gender,
//       dob,
//       address,
//       pincode,
//       password,
//       state,
//       division,
//       district,
//       taluka,
//     } = req.body;

//     // Uploaded photo file (from multer)
//     const photo = req.file ? req.file.filename : null;

//     // For username, use email or mobile or fallback
//     const username = email_id || mobile_no || "user_" + Date.now();

//     // Hash password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Call Postgres signup function
//     const result = await pool.query(
//       `SELECT * FROM public.register_visitor(
//         $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13
//       )`,
//       [
//         username.slice(0, 100),
//         hashedPassword,
//         full_name?.slice(0, 255),
//         gender?.charAt(0) || null,
//         dob || null,
//         mobile_no?.slice(0, 15) || null,
//         email_id?.slice(0, 255) || null,
//         state?.slice(0, 2) || null,
//         division?.slice(0, 5) || null,
//         district?.slice(0, 5) || null,
//         taluka?.slice(0, 5) || null,
//         pincode?.slice(0, 10) || null,
//         photo?.slice(0, 500) || null
//       ]
//     );

//     const row = result.rows[0];

//     // Check if registration failed due to existing username/email/mobile
//     if (!row || row.message !== "Registration successful") {
//       return res.status(400).json({
//         success: false,
//         message: row?.message || "Failed to signup visitor",
//       });
//     }

//     // Success response
//     res.status(201).json({
//       success: true,
//       message: row.message,
//       user_id: row.out_user_id,
//       visitor_id: row.visitor_id,
//     });

//   } catch (error) {
//     console.error("Error in insertVisitorSignup:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to signup visitor",
//       error: error.message,
//     });
//   }
// };



// exports.insertVisitorSignup = async (req, res) => {
//   try {
//     // 1️⃣ Extract fields from frontend form
//     const {
//       username,
//       full_name,
//       email_id,
//       mobile_no,
//       gender,
//       dob,
//       address,
//       pincode,
//       password,
//       state,
//       division,
//       district,
//       taluka,
//       insert_by,
//       insert_ip,
//     } = req.body;

//     // 2️⃣ Handle uploaded photo (via multer)
//     const photo = req.file ? req.file.filename : null;

//     // 3️⃣ Hash password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // 4️⃣ Insert into m_users (auto-generate user_id)
//     const userResult = await pool.query(
//       `INSERT INTO m_users (
//           username, password_hash, role_code, is_active, insert_ip, insert_by
//         )
//         VALUES ($1, $2, $3, TRUE, $4, $5)
//         RETURNING user_id;`,
//       [
//         username?.slice(0, 100),
//         hashedPassword,
//         "VS", // Visitor role
//         insert_ip?.slice(0, 50) || "NA",
//         insert_by?.slice(0, 100) || "system",
//       ]
//     );

//     // 5️⃣ Get generated user_id from DB
//     const user_id = userResult.rows[0].user_id;

//     // 6️⃣ Call your Postgres stored function for visitor details
//     const result = await pool.query(
//   `SELECT * FROM public.register_visitor(
//     $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12
//   );`,
//   [
//     username,
//     hashedPassword,
//     full_name,
//     gender?.charAt(0) || null,
//     dob || null,
//     mobile_no?.slice(0, 15) || null,
//     email_id?.slice(0, 255) || null,
//     state?.slice(0, 2) || null,
//     division?.slice(0, 5) || null,
//     district?.slice(0, 5) || null,
//     taluka?.slice(0, 5) || null,
//     pincode?.slice(0, 10) || null,
//     photo?.slice(0, 500) || null
//   ]
// );

//     const row = result.rows[0];

//     // 7️⃣ Handle DB function result
//     if (!row || row.message !== "Registration successful") {
//       return res.status(400).json({
//         success: false,
//         message: row?.message || "Failed to signup visitor",
//       });
//     }

//     // 8️⃣ Return success response
//     res.status(201).json({
//       success: true,
//       message: "Visitor registered successfully",
//       user_id,
//       visitor_id: row.visitor_id,
//     });

//   } catch (error) {
//     console.error("❌ Error in insertVisitorSignup:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to signup visitor",
//       error: error.message,
//     });
//   }
// };

exports.insertVisitorSignup = async (req, res) => {
  try {
    // Extract fields from frontend
    const {
      full_name,
      email_id,
      mobile_no,
      gender,
      dob,
      state,
      division,
      district,
      taluka,
      pincode,
      password,
    } = req.body;

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

    // Call PostgreSQL function
    const result = await pool.query(
      `SELECT * FROM public.register_visitor(
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13
      );`,
      [
        full_name?.trim().slice(0, 100),   // p_username
        hashedPassword,                     // p_password_hash
        full_name?.trim().slice(0, 255),   // p_full_name
        gender?.charAt(0) || null,         // p_gender
        dob || null,                        // p_dob
        mobile_no?.trim() || null,          // p_mobile_no
        email_id?.trim() || null,           // p_email_id
        state?.trim() || null,              // p_state_code
        division?.trim() || null,           // p_division_code
        district?.trim() || null,           // p_district_code
        taluka?.trim() || null,             // p_taluka_code
        pincode?.trim() || null,            // p_pincode
        photo?.trim() || null               // p_photo
      ]
    );

    const row = result.rows[0];

    // Handle DB function result
    if (!row || row.message !== "Registration successful") {
      return res.status(400).json({
        success: false,
        message: row?.message || "Failed to signup visitor",
      });
    }

    // Success response
    res.status(201).json({
      success: true,
      message: row.message,
      user_id: row.user_id,
      visitor_id: row.visitor_id,
    });

  } catch (error) {
    console.error("❌ Error in insertVisitorSignup:", error);
    res.status(500).json({
      success: false,
      message: "Failed to signup visitor",
      error: error.message,
    });
  }
};

exports.login = async (req, res) => {
  const { user_id, password } = req.body;

  try {
    // 1️⃣ Fetch user details by user_id
    const result = await pool.query("SELECT * FROM get_user_by_id($1);", [user_id]);
    console.log(result,"result")
    const user = result.rows[0];
    //console.log(user)
    // 2️⃣ Check if user exists
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User ID not found",
      });
    }

    // 3️⃣ Check if account is active
    if (!user.out_is_active) {
      return res.status(403).json({
        success: false,
        message: "Account is inactive",
      });
    }

    // 4️⃣ Verify password using bcrypt
    const isMatch = await bcrypt.compare(password, user.out_password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid password",
      });
    }

    // 5️⃣ Success — return login info
    res.status(200).json({
      success: true,
      message: "Login successful",
      user_id: user.out_user_id,
      role: user.out_role_code,
    });
  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};



