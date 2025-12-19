import React, { useState,useEffect } from "react";
import { Link,useNavigate } from "react-router-dom";
import { FaHome, FaCalendarAlt, FaHistory, FaBell, FaUserCircle } from "react-icons/fa";
import "../css/VisitorNavbar.css";
import { toast } from "react-toastify";

function VisitorNavbar({ fullName }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate=useNavigate();
     const username = localStorage.getItem("username"); 

const handleLogout = () => {
    // Clear all session/local storage data
    localStorage.removeItem("token");
    localStorage.removeItem("user_id");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    localStorage.removeItem("userstate_code");
    localStorage.removeItem("userdivision_code");
    localStorage.removeItem("userdistrict_code");
    localStorage.removeItem("usertaluka_code");

    // Redirect to login
   navigate('/logout');
  };
  useEffect(()=>{if (!username) {
      toast.error("Please log in first");
      navigate("/login");
      return;}},[username])
  
  return (
    <nav className="navbar">
      <ul className="nav-links">
        <li><Link to="/dashboard1"><FaHome /> Home</Link></li>
        <li><Link to="/appointment-wizard"><FaCalendarAlt /> Appointments Booking</Link></li>
        <li><Link to="/appointments"><FaHistory /> Appointment History</Link></li>
        <li><Link to="/notifications"><FaBell /> Notifications</Link></li>
      </ul>

      <div className="navbar-right">
        <div className="profile" onClick={() => setDropdownOpen(!dropdownOpen)}>
          <FaUserCircle className="profile-icon" />
          <span className="profile-name">{fullName || "Guest"}</span>
        </div>
        {dropdownOpen && (
          <div className="dropdown">
            <Link to="/profile">My Profile</Link>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

export default VisitorNavbar;
