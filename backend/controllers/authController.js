const pool = require("../db");
const bcrypt = require("bcrypt");
require("dotenv").config();
const { sendMail } = require("../helpers/sendMail");

/* =====================================================
   1️⃣ SEND OTP FOR FORGOT PASSWORD
===================================================== */
exports.sendForgotPasswordOtp = async (req, res) => {
  try {
    const { identifier } = req.body;

    if (!identifier) {
      return res.status(400).json({
        success: false,
        message: "Username / Email / Mobile is required",
      });
    }

    // Call DB function
    const result = await pool.query(
      `SELECT generate_password_reset_otp($1) AS result`,
      [identifier]
    );

    const response = result.rows[0].result;

    if (!response.success) {
      return res.status(404).json(response);
    }

    // 🔐 OTP (remove in production)
    const otp = response.otp;
    const email = response.email;

    // Send Email
    try {
      await sendMail(
        email,
        "Password Reset OTP - SevaDwaar",
        `
        <p>Your OTP for password reset is:</p>
        <h2>${otp}</h2>
        <p>This OTP is valid for <b>5 minutes</b>.</p>
        <p>If you did not request this, please ignore.</p>
        `
      );
    } catch (mailErr) {
      console.error("OTP email failed:", mailErr);
    }

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });

  } catch (error) {
    console.error("sendForgotPasswordOtp error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};



/* =====================================================
   3️⃣ RESET PASSWORD USING OTP
===================================================== */
exports.resetPasswordWithOtp = async (req, res) => {
  try {
    const { identifier, otp, new_password } = req.body;

    if (!identifier || !otp || !new_password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(new_password, 10);

    const result = await pool.query(
      `SELECT reset_password_with_otp($1,$2,$3,$4) AS result`,
      [
        identifier,
        otp,
        hashedPassword,
        req.ip || "NA",
      ]
    );

    const response = result.rows[0].result;

    if (!response.success) {
      return res.status(400).json(response);
    }

    return res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });

  } catch (error) {
    console.error("resetPasswordWithOtp error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};