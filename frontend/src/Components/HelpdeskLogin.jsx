import React, { useState,useRef,useMemo } from "react";
import { useNavigate,Link } from "react-router-dom";
import { toast } from "react-toastify";
import "../css/OfficersLogin.css"; // Reuse officer login styles
import logo from "../assets/emblem2.png";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

const HelpdeskLogin = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
    const boxRef = useRef(null);
  
  const navigate = useNavigate();
  const [progress, setProgress] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/helpdesk/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
   console.log(data,"datahelpdesk")
      if (data.success) {
        // localStorage.setItem("helpdesk_id", data.helpdesk_id);
        // localStorage.setItem("helpdesk_username", data.username);
        // localStorage.setItem("helpdesk_role", data.role_code || "helpdesk");
        // localStorage.setItem("helpdesk_location", data.location_id || "");
        localStorage.setItem("token", data.token);
localStorage.setItem("user_id", data.user_id);
localStorage.setItem("officer_id", data.officer_id);
localStorage.setItem("role_code", data.role || "");
localStorage.setItem("username", data.username);
localStorage.setItem("state", data.state);
localStorage.setItem("division", data.division);
localStorage.setItem("district", data.district);
localStorage.setItem("taluka", data.taluka);
        toast.success("Login successful!");
        navigate("/helpdesk/dashboard");
      } else {
        toast.error(data.message || "Invalid credentials");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Server error. Please try again.");
    } finally {
      setLoading(false);
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
            </div>
            <div ref={boxRef} className="login-box">
      <span>
    <button className="back-btn" onClick={() => navigate(-1)}>
                ← Back
              </button>
  </span>
  <h2 className="login-title">Helpdesk Login</h2>
    
        {/* <div className="login-header">
          <h2>Helpdesk Login</h2>
          <p>Access the helpdesk portal</p>
        </div> */}

        <form onSubmit={handleSubmit} className="form">
          {/* <div className="form-group"> */}
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter your username"
              required
            />
          {/* </div> */}

          {/* <div className="form-group"> */}
            <label>
            Password<span className="required">*</span>
          </label>
            <div style={{ position: "relative" }}>
            <input
              type={showPass ? "text" : "password"}
              placeholder="Enter password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
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

          
          {/* </div> */}

<Link to="/forgot" className="forgot">
            Forgot your password?
          </Link>
          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>

        {/* <div className="login-footer">
          <button 
            type="button" 
            className="back-link"
            onClick={() => navigate("/login")}
          >
            ← Back to Login Options
          </button>
        </div>
       */}
        </form>

      </div>
    </div>
  );
};

export default HelpdeskLogin;

