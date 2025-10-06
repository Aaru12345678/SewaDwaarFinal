import React, { useState, useCallback, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { loginUser } from "../services/api1"; // only login needed
import CryptoJS from "crypto-js";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import "../css/OfficersLogin.css";
import logo from "../assets/emblem2.png";

export default function OfficerLogin() {
  const navigate = useNavigate();
  const boxRef = useRef(null);

  const [officerId, setOfficerId] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(false);

  const isDisabled = !officerId.trim() || !password.trim() || loading;

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setLoading(true);
      setProgress(true);

      try {
        const hashedPassword = CryptoJS.SHA256(password).toString();
        const credentials = { user_name: officerId, password: hashedPassword };

        const { data, error } = await loginUser(credentials);

        if (error) {
          toast.error(error.message || "Invalid credentials");
          if (boxRef.current) {
            boxRef.current.classList.add("shake");
            setTimeout(() => boxRef.current.classList.remove("shake"), 300);
          }
          return;
        }

        // Save token & session details
        localStorage.setItem("token", data.token);
        localStorage.setItem("officer_id", officerId);

        toast.success("Login successful 🎉");
        setTimeout(() => navigate("/officer/dashboard"), 800);
      } catch (err) {
        console.error(err);
        toast.error("Something went wrong, try again.");
      } finally {
        setLoading(false);
        setTimeout(() => setProgress(false), 400);
      }
    },
    [officerId, password, navigate]
  );

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
        <h2 className="login-title">Officer's Login</h2>

        <form className="form" onSubmit={handleSubmit}>
          <label>
            Officer ID<span className="required">*</span>
          </label>
          <input
            type="text"
            placeholder="Enter Officer ID"
            value={officerId}
            onChange={(e) => setOfficerId(e.target.value)}
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

          <button
            type="submit"
            className="submit-btn"
            disabled={isDisabled}
          >
            {loading ? "Processing..." : "Login"}
          </button>
        </form>
      </div>

      <div className="footer">
        {/* <img src="/ashok-chakra.png" alt="Ashok Chakra" className="chakra" /> */}
      </div>
    </div>
  );
}
