import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "../css/Signup.css"; // reuse same CSS

import {
  sendForgotOtp,
  resetPassword,
} from "../services/api";
// const userIdRegex = /^[A-Z][A-Za-z0-9-]*$/;     // First letter capital, only hyphen allowed
const emailRegex =
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;                // Standard email
const mobileRegex = /^[6-9]\d{9}$/;             // Starts 6–9, exactly 10 digits

const getIdentifierType = (value) => {
  if (/^\d+$/.test(value)) return "mobile";
  if (value.includes("@")) return "email";
  return "userid";
};

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [otpTimer, setOtpTimer] = useState(0);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    identifier: "",
    otp: "",
    password: "",
    confirmPassword: "",
  });

  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;

  /* ===================== HANDLE CHANGE ===================== */
 const handleChange = (e) => {
  const { name, value } = e.target;

  if (name === "identifier") {
    const type = getIdentifierType(value);

    // 🔹 MOBILE → digits only, max 10
    if (type === "mobile") {
      if (!/^\d*$/.test(value)) return;
      if (value.length > 10) return;
    }

    // 🔹 EMAIL → allow normal typing (no blocking)

    // 🔹 USERID → NO VALIDATION / NO RESTRICTIONS

    setForm({ ...form, identifier: value });
    return;
  }

  setForm({ ...form, [name]: value });
};

  /* ===================== SEND OTP ===================== */
const handleSendOtp = async () => {
  if (!form.identifier) {
    return Swal.fire("Error", "Enter UserId / Email / Mobile", "error");
  }

  const type = getIdentifierType(form.identifier);

  if (type === "email" && !emailRegex.test(form.identifier)) {
    return Swal.fire("Error", "Invalid email format", "error");
  }

  if (type === "mobile" && !mobileRegex.test(form.identifier)) {
    return Swal.fire(
      "Error",
      "Mobile number must start with 6–9 and be 10 digits",
      "error"
    );
  }

  setLoading(true);
  try {
    const res = await sendForgotOtp({ identifier: form.identifier });

    Swal.fire("Success", res.data.message, "success");
    setStep(2);
    setOtpTimer(60);
    setForm(prev => ({ ...prev, otp: "" }));

  } catch (err) {
    Swal.fire(
      "Error",
      err.response?.data?.message || "Failed to send OTP",
      "error"
    );
  } finally {
    setLoading(false);
  }
};



  /* ===================== RESET PASSWORD ===================== */
  const handleResetPassword = async () => {
    if (!passwordRegex.test(form.password)) {
      return Swal.fire(
        "Error",
        "Password must be strong (8+, uppercase, number, special)",
        "error"
      );
    }

    if (form.password !== form.confirmPassword) {
      return Swal.fire("Error", "Passwords do not match", "error");
    }

    setLoading(true);
    try {
      await resetPassword({
        identifier: form.identifier,
        otp: form.otp,
        new_password: form.password,
      });

      Swal.fire({
        icon: "success",
        title: "Password Reset Successful",
        text: "Please login with your new password",
      }).then(() => navigate("/login"));

    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.message || "Password reset failed",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
  if (otpTimer > 0) {
    const interval = setInterval(() => setOtpTimer(prev => prev - 1), 1000);
    return () => clearInterval(interval);
  }
}, [otpTimer]);
  /* ===================== UI ===================== */
  return (
    <div className="signup-page">
      <main className="login-box">

        <h2 className="login-title">Forgot Password</h2>

        {/* STEP 1 */}
        {step === 1 && (
          <>
            <div className="form-field full">
              <label>UserId / Email / Mobile</label>
              <input
                name="identifier"
                value={form.identifier}
                onChange={handleChange}
                required
              />
            </div>

            <button
  className="submit-btn"
  onClick={handleSendOtp}
  disabled={loading}
>
  {loading ? "Sending OTP..." : "Send OTP"}
</button>

          </>
        )}

        {/* STEP 2 */}
        {step === 2 && (
  <>
    <div className="form-field full">
      <label>Enter OTP</label>
      <input
        name="otp"
        value={form.otp}
        onChange={handleChange}
        maxLength={6}
        required
      />
    </div>

    <div className="form-field full">
      <label>New Password</label>
      <input
        type="password"
        name="password"
        value={form.password}
        onChange={handleChange}
        required
      />
    </div>

    <div className="form-field full">
      <label>Confirm Password</label>
      <input
        type="password"
        name="confirmPassword"
        value={form.confirmPassword}
        onChange={handleChange}
        required
      />
    </div>

    <button
      className="submit-btn"
      onClick={handleResetPassword}
      disabled={loading}
    >
      Reset Password
    </button>

    {/* Resend OTP */}
    <button
  className="link-btn"
  onClick={handleSendOtp}
  disabled={otpTimer > 0 || loading}
>
  {otpTimer > 0 ? `Resend OTP in ${otpTimer}s` : "Resend OTP"}
</button>

  </>
)}


      </main>
    </div>
  );
}
