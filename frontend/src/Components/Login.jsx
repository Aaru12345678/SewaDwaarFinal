import React, { useState, useMemo, useRef,useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { login, getVisitorDashboard } from "../services/api";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import "../css/Login.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUniversalAccess } from "@fortawesome/free-solid-svg-icons";
import logo from "../assets/emblem.png";
import Swal from "sweetalert2";

export default function Login() {
  const navigate = useNavigate();
  const boxRef = useRef(null);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(false);

  const [superUserMode, setSuperUserMode] = useState(false);
  const [missingFields, setMissingFields] = useState({});

  const [captchaText, setCaptchaText] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");
  const canvasRef = React.useRef(null);
  

  const isDisabled = useMemo(
    () => !username.trim() || !password.trim() || loading,
    [username, password, loading]
  );

  /* ===============Genrate captcha ========================*/
  const generateCaptchaText = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let text = "";
    for (let i = 0; i < 6; i++) {
      text += chars[Math.floor(Math.random() * chars.length)];
    }
    return text;
  };
  
  const drawCaptcha = (text) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
  
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  
    // Background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  
    // Noise lines
    for (let i = 0; i < 5; i++) {
      ctx.strokeStyle = `rgba(0,0,0,0.2)`;
      ctx.beginPath();
      ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
      ctx.stroke();
    }
  
    ctx.font = "bold 32px Arial";
    ctx.textBaseline = "middle";
  
    [...text].forEach((char, i) => {
      const x = 30 + i * 28;
      const y = 40 + Math.sin(i) * 10;
      const angle = (Math.random() - 0.5) * 0.5;
  
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.fillStyle = "#000";
      ctx.fillText(char, 0, 0);
      ctx.restore();
    });
  };
  
  const refreshCaptcha = () => {
    const text = generateCaptchaText();
    setCaptchaText(text);
    setCaptchaInput("");
    drawCaptcha(text);
  };
  
  useEffect(() => {
    refreshCaptcha();
  }, []);
  

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      toast.error("Please enter username and password");
      return;
    }

    if (captchaInput !== captchaText) {
      Swal.fire("Error", "Invalid captcha", "error");
      refreshCaptcha();
      return;
    }
    

    setLoading(true);
    setProgress(true);

    try {
      const payload = { username, password };
      console.log(payload)
      const { data } = await login(payload);
      console.log(data,"data")
      if (!data?.success) {
        toast.error(data?.message || "Invalid credentials");
        return;
      }

      // 🔐 Store session data
      localStorage.setItem("visitor_id", data.user.visitor_id);
      localStorage.setItem("user_id", data.user.user_id);
      localStorage.setItem("username", data.user.username);
      localStorage.setItem("role_code", data.user.role || "");
      // localStorage.setItem("is_first_login", data.user.is_first_login);
      localStorage.setItem("userstate_code", data.user.state_code);
      localStorage.setItem("userdivision_code", data.user.division_code);
      localStorage.setItem("userdistrict_code", data.user.district_code);
      localStorage.setItem("usertaluka_code", data.user.taluka_code);
      // 👤 Fetch & store full name (no alert)

      if (data.user.is_first_login === true) {

  // 🔑 STORE IT
  localStorage.setItem("is_first_login", "true");
  localStorage.setItem("user_id", data.user.user_id);

  Swal.fire({
    title: "First Login",
    text: "This is your first login. Please change your password first.",
    icon: "warning",
    confirmButtonText: "Change Password",
    allowOutsideClick: false,
    allowEscapeKey: false,
  }).then(() => {
    navigate("/change-password");
  });

  return; // ⛔ stop further navigation
}

      try {
        const dashboardRes = await getVisitorDashboard(data.username);
        const fullName =
          dashboardRes?.data?.full_name || data.username;
        localStorage.setItem("fullName", fullName);
      } catch (err) {
        console.warn("Unable to fetch full name, using username");
        localStorage.setItem("fullName", data.username);
      }

      // ✅ NO SUCCESS / WELCOME TOAST
      navigate("/dashboard1");
    } catch (err) {
      console.error("Login error:", err);
      toast.error("Something went wrong, try again.");
    } finally {
      setLoading(false);
      setTimeout(() => setProgress(false), 400);
    }
  };

  return (
    <div className="container">
      {progress && <div className="progress-bar"></div>}

      <div className="header">
        <div className="logo-group">
          <Link to="/">
            <img src={logo} alt="India Logo" className="logo" />
          </Link>
          <div className="gov-text">
            <p className="hindi">महाराष्ट्र शासन</p>
            <p className="english">Government of Maharashtra</p>
          </div>
        </div>
        <div className="right-controls">
          <span className="lang">अ/A</span>
          <FontAwesomeIcon
            icon={faUniversalAccess}
            size="1x"
            className="access"
          />
        </div>
      </div>

      <div ref={boxRef} className="login-box">
        <span>
    <button className="back-btn" onClick={() => navigate(-1)}>
                ← Back
              </button>
  </span>
        <h2 className="login-title">
          {superUserMode ? "Complete Superuser Profile" : "Login"}
        </h2>

        <form
          className="form"
          onSubmit={superUserMode ? (e) => e.preventDefault() : handleSubmit}
        >
          {!superUserMode && (
            <>
              <label>
                Username/Email/Mobile no.<span className="required">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter UserId/Email/Mobile no."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />

              <label>
                Password<span className="required">*</span>
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ paddingRight: "35px" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    color: "#555",
                  }}
                >
                  {showPass ? <AiOutlineEye /> : <AiOutlineEyeInvisible />}
                </button>
              </div>
                 {/* CAPTCHA */}
<div className="form-field">
  <label>Captcha *</label>

  <div className="captcha-wrapper">
    <canvas
      ref={canvasRef}
      width={220}
      height={80}
      className="captcha-canvas"
    />
    <button
      type="button"
      className="captcha-refresh"
      onClick={refreshCaptcha}
      title="Refresh Captcha"
    >
      🔄
    </button>
  </div>

  <input
    type="text"
    placeholder="Enter captcha"
    value={captchaInput}
    onChange={(e) => setCaptchaInput(e.target.value.toUpperCase())}
  />
</div>


              <Link to="/forgot" className="forgot">
                Forgot your password?
              </Link>
            </>
          )}

          {superUserMode &&
            Object.keys(missingFields).map((field) => (
              <div key={field}>
                <label>
                  {field.replace("_", " ").toUpperCase()}
                  <span className="required">*</span>
                </label>
                <input
                  type={field.includes("email") ? "email" : "text"}
                  value={missingFields[field]}
                  onChange={(e) =>
                    setMissingFields((prev) => ({
                      ...prev,
                      [field]: e.target.value,
                    }))
                  }
                  required
                />
              </div>
            ))}

          <button
            type={superUserMode ? "button" : "submit"}
            className="submit-btn"
            disabled={isDisabled}
          >
            {loading
              ? "Processing..."
              : superUserMode
              ? "Update Profile"
              : "Login"}
          </button>

          {!superUserMode && (
            <div className="signup-link">
              <p>
                Don’t have an account?{" "}
                <span
                  className="create-link"
                  onClick={() => navigate("/signup")}
                  style={{
                    color: "#007bff",
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                >
                  Create one
                </span>
              </p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
