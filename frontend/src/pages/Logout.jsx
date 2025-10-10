import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "../css/Logout.css";

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Clear all authentication info
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("user"); // if you are storing full user object
    sessionStorage.clear();

    // Show logout message
    // toast.success("🔒 You have been securely logged out");

  });

  return (
    <div className="govt-logout-page">
      <div className="govt-header">
        <img
          src="/images/emblem copy.png"
          alt="Government Logo"
          className="govt-logo"
        />
        <h2>Digital Appointment Management System</h2>
        <p>Government of India</p>
      </div>

      <div className="logout-box">
        <h1>🔒 You have been securely logged out</h1>
        <p>
          Thank you for using the Digital Appointment Management Portal. <br />
          Your session has ended for security reasons.
        </p>
        <button onClick={() => navigate("/login")} className="return-btn">
          Return to Login Page
        </button>
      </div>

      <footer className="govt-footer">
        © {new Date().getFullYear()} Government of India | All Rights Reserved
      </footer>
    </div>
  );
};

export default Logout;
