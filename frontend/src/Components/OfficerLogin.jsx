import React, { useState, useRef, useMemo,useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { officerLogin } from "../services/api.jsx"; // ✅ Officer API
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import "../css/OfficersLogin.css";
import logo from "../assets/emblem2.png";
import Swal from "sweetalert2";

export default function OfficerLogin() {
  const navigate = useNavigate();
  const boxRef = useRef(null);

  const [officerId, setOfficerId] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(false);
  const [username, setUsername] = useState("");
  const [captchaText, setCaptchaText] = useState("");
    const [captchaInput, setCaptchaInput] = useState("");
    const canvasRef = React.useRef(null);
    
  const isDisabled = useMemo(
    () =>
      !username.trim() || !password.trim() || loading,
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
    
  

  const handleOfficerLogin = async (e) => {
  e.preventDefault();

  if (!username || !password) {
    toast.error("Please enter officer ID and password");
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
    const payload = {
  username, // ← backend expects username
  password,            // ← backend expects password
};


    const { data } = await officerLogin(payload);

    // const row = data[0]; // first row of returned table

    if (!data.success) {
          toast.error(data.message || "Invalid credentials");
    
          if (boxRef.current) {
            boxRef.current.classList.add("shake");
            setTimeout(() => boxRef.current.classList.remove("shake"), 300);
          }
          return;
        }
    
    // Save officer info
   // storing response
localStorage.setItem("token", data.token);
localStorage.setItem("user_id", data.user_id);
localStorage.setItem("officer_id", data.officer_id);
localStorage.setItem("role_code", data.role || "");
localStorage.setItem("username", data.username);

    toast.success("Login successful 🎉");
    navigate("/dashboard");
  } catch (err) {
    console.error("Officer login error:", err);
    toast.error("Something went wrong, try again.");
  } finally {
    setLoading(false);
    setTimeout(() => setProgress(false), 400);
  }
};
  console.log(username,password);

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
      </div>

      <div ref={boxRef} className="login-box">
        <span>
    <button className="back-btn" onClick={() => navigate(-1)}>
                ← Back
              </button>
  </span>
        <h2 className="login-title">Officer's Login</h2>

        <form className="form" onSubmit={handleOfficerLogin}>
          <label>
            Officer ID/Email/Mobile no.<span className="required">*</span>
          </label>
          <input
            type="text"
            placeholder="Enter Officer ID/Email/Mobile no."
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

          <button type="submit" className="submit-btn" disabled={isDisabled}>
            {loading ? "Processing..." : "Login"}
          </button>
        </form>
      </div>

      {/* <div className="footer"></div> */}
    </div>
  );
}
