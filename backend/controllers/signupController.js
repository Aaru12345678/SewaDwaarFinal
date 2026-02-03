const pool = require('../db');
require("dotenv").config(); // Ensure JWT_SECRET is loaded
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const {verifyToken} = '../helpers/middleware'
const bcrypt = require("bcrypt");

// generate token:
function generateToken(user) {
  return jwt.sign(
    {
      user_id: user.out_user_id,
      role: user.out_role_code,
      is_first_login: user.out_is_first_login // 👈 ADD
    },
    process.env.JWT_SECRET,
    { expiresIn: "20m" }
  );
}


const path = require("path");
const fs = require("fs");

// Multer setup for photo upload
const multer = require("multer");
const { sendMail } = require('../helpers/sendMail');
const isValidJpeg = (filePath) => {
  const buffer = Buffer.alloc(3);
  const fd = fs.openSync(filePath, "r");
  fs.readSync(fd, buffer, 0, 3, 0);
  fs.closeSync(fd);

  // JPEG magic bytes: FF D8 FF
  return buffer[0] === 0xff &&
         buffer[1] === 0xd8 &&
         buffer[2] === 0xff;
};

// Folder to save uploaded photos
const UPLOAD_DIR = path.join(__dirname, "../uploads/visitors");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });



const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, UPLOAD_DIR);
    },
    filename: function (req, file, cb) {
      const filename = `${Date.now()}_${Math.round(Math.random() * 1e9)}.jpg`;
      cb(null, filename); // force .jpg
    },
  }),
  limits: { fileSize: 200 * 1024 }, // 200 KB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "image/jpeg") {
      cb(null, true);
    } else {
      cb(new Error("Only JPG/JPEG images are allowed"));
    }
  },
});





exports.insertVisitorSignup = (req, res) => {
  upload.single("photo")(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }

    try {
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

      /* ---------- PHOTO VALIDATION ---------- */
      let photo = null;
      if (req.file) {
        const filePath = req.file.path;

        if (!isValidJpeg(filePath)) {
          fs.unlinkSync(filePath); // ❌ delete malicious file
          return res.status(400).json({
            success: false,
            message: "Invalid image file. Only real JPG images are allowed.",
          });
        }

        photo = req.file.filename;
      }

      /* ---------- PASSWORD ---------- */
      const hashedPassword = await bcrypt.hash(password, 10);

      /* ---------- DB CALL ---------- */
      const result = await pool.query(
        `SELECT * FROM register_visitor(
          $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12
        );`,
        [
          hashedPassword,
          full_name.trim().slice(0, 255),
          gender?.charAt(0) || null,
          dob || null,
          mobile_no?.trim() || null,
          email_id?.trim() || null,
          state?.trim() || null,
          division?.trim() || null,
          district?.trim() || null,
          taluka?.trim() || null,
          pincode?.trim() || null,
          photo,
        ]
      );

      const row = result.rows[0];

      if (!row || row.message !== "Registration successful") {
        return res.status(400).json({
          success: false,
          message: row?.message || "Failed to signup visitor",
        });
      }

      /* ---------- EMAIL ---------- */
      try {
        await sendMail(
          row.out_email_id,
          "Welcome to SevaDwaar",
          `Hi ${row.full_name},\n\nYour Visitor ID is: ${row.visitor_id}`
        );
      } catch (mailErr) {
        console.error("Email failed:", mailErr);
      }

      /* ---------- RESPONSE ---------- */
      return res.status(201).json({
        success: true,
        message: "Registration successful. Visitor ID mailed!",
        user_id: row.out_user_id,
        visitor_id: row.visitor_id,
      });

    } catch (error) {
      console.error("❌ Error in insertVisitorSignup:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to signup visitor",
        error: error.message,
      });
    }
  });
};

exports.login = async (req, res) => {
  const { username, password } = req.body;

  try {

    // 1️⃣ Fetch user details by username
    const result = await pool.query("SELECT * FROM get_user_by_username2($1);", [username]);
    const user = result.rows[0];
   console.log(user,"localStorage.getItem")

    // 2️⃣ Check if user exists
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Username not found",
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


// 👇 Generate Token
    const token = generateToken(user);



    // 5️⃣ Success — return login info
    res.status(200).json({
  success: true,
  message: "Login successful",
  token,
  user: {
    user_id: user.out_user_id,
    username: user.out_username,
    role: user.out_role_code,
    is_first_login: user.out_is_first_login,
    state_code: user.out_state_code,
    division_code: user.out_division_code,
    district_code: user.out_district_code,
    taluka_code: user.out_taluka_code
  }
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


exports.changePassword = async (req, res) => {
  const { user_id, old_password, new_password } = req.body;

  try {
    // 1️⃣ Get current password hash
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
    const isMatch = await bcrypt.compare(old_password, userRes.rows[0].password_hash);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Old password is incorrect",
      });
    }

    // 3️⃣ Hash new password
    const hashedNewPassword = await bcrypt.hash(new_password, 10);

    // 4️⃣ Call DB function (updates password + is_first_login)
    const result = await pool.query(
      "SELECT * FROM change_user_password($1, $2)",
      [user_id, hashedNewPassword]
    );
   console.log(result)
    // 5️⃣ Send response
    return res.json(result.rows[0]);

  } catch (err) {
    console.error("changePassword error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};



const crypto = require("crypto");


exports.insertVisitorSignupWalkin = (req, res) => {
  console.log("REQ HEADERS:", req.headers);
  upload.single("photo")(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }

    console.log("BODY:", req.body);
    console.log("FILE:", req.file);

    try {

      const {
        full_name,
        gender,
        dob,
        mobile_no,
        email_id,
        state,
        division,
        district,
        taluka,
        pincode,
      } = req.body;

      if (!full_name || !mobile_no) {
        return res.status(400).json({
          success: false,
          message: "Full name and mobile number are required",
        });
      }

      /* ---------- PHOTO VALIDATION ---------- */
      let photoFilename = null;

      if (req.file) {
        const filePath = req.file.path;

        if (!isValidJpeg(filePath)) {
          fs.unlinkSync(filePath);
          return res.status(400).json({
            success: false,
            message: "Invalid image file. Only real JPG images are allowed.",
          });
        }

        photoFilename = req.file.filename;
      }

      /* ---------- PASSWORD ---------- */
      const plainPassword = crypto.randomBytes(4).toString("hex");
      const hashedPassword = await bcrypt.hash(plainPassword, 10);

      /* ---------- DB CALL ---------- */
      const result = await pool.query(
        `SELECT * FROM register_visitor_walkin(
          $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12
        );`,
        [
          hashedPassword,
          full_name.trim(),
          gender?.charAt(0) || null,
          dob || null,
          mobile_no.trim(),
          email_id?.trim() || null,
          state || null,
          division || null,
          district || null,
          taluka || null,
          pincode || null,
          photoFilename, // ✅ SAME AS NORMAL SIGNUP
        ]
      );

      const row = result.rows[0];

      if (!row || row.message !== "Registration successful") {
        return res.status(400).json({
          success: false,
          message: row?.message || "Visitor registration failed",
        });
      }

      return res.status(201).json({
        success: true,
        message: "Walk-in visitor registered successfully",
        visitor_id: row.visitor_id,
        user_id: row.out_user_id,
      });

    } catch (error) {
      console.error("❌ Walk-in signup error:", error);
      return res.status(500).json({
        success: false,
        message: "Server error",
      });
    }
  });
};
