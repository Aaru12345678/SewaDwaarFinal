import React, { useState, useRef, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { adminLoginAPI,officerLogin } from "../services/api.jsx"; // ✅ Admin API
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import "../css/OfficersLogin.css";
import logo from "../assets/emblem2.png";

export default function AdminLogin() {
  const navigate = useNavigate();
  const boxRef = useRef(null);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(false);
  

  const isDisabled = useMemo(
    () => !username.trim() || !password.trim() || loading,
    [username, password, loading]
  );

  const handleAdminLogin = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      toast.error("Please enter username and password");
      return;
    }

    setLoading(true);
    setProgress(true);

    try {
      const payload = { username, password };
      const { data } = await officerLogin(payload);

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
          navigate("/admin");
        } catch (err) {
          console.error("Officer login error:", err);
          toast.error("Something went wrong, try again.");
        } finally {
          setLoading(false);
          setTimeout(() => setProgress(false), 400);
        }
      };
        // console.log(username,password);

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
        <h2 className="login-title">Admin Login</h2>

        <form className="form" onSubmit={handleAdminLogin}>
          <label>
            Admin ID<span className="required">*</span>
          </label>
          <input
            type="text"
            placeholder="Enter Admin ID"
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

          <button type="submit" className="submit-btn" disabled={isDisabled}>
            {loading ? "Processing..." : "Login"}
          </button>
        </form>
      </div>

      {/* <div className="footer"></div> */}
    </div>
  );
}
