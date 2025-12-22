import React, { useState, useMemo, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { login, getVisitorDashboard } from "../services/api";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import "../css/Login.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUniversalAccess } from "@fortawesome/free-solid-svg-icons";
import logo from "../assets/emblem.png";

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

  const isDisabled = useMemo(
    () => !username.trim() || !password.trim() || loading,
    [username, password, loading]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      toast.error("Please enter username and password");
      return;
    }

    setLoading(true);
    setProgress(true);

    try {
      const payload = { username, password };
      const { data } = await login(payload);

      if (!data?.success) {
        toast.error(data?.message || "Invalid credentials");
        return;
      }

      // 🔐 Store session data
      localStorage.setItem("visitor_id", data.visitor_id);
      localStorage.setItem("user_id", data.user_id);
      localStorage.setItem("username", data.username);
      localStorage.setItem("role_code", data.role || "");
      localStorage.setItem("userstate_code", data.userstate_code);
      localStorage.setItem("userdivision_code", data.userdivision_code);
      localStorage.setItem("userdistrict_code", data.userdistrict_code);
      localStorage.setItem("usertaluka_code", data.usertaluka_code);

      // 👤 Fetch & store full name (no alert)
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
                placeholder="Enter Username/Email/Mobile no."
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
