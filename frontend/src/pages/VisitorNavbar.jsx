import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaHome, FaCalendarAlt, FaHistory, FaBell, FaUserCircle } from "react-icons/fa";
import "./VisitorNavbar.css";

function VisitorNavbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
const userName = "Ravi Tambe";
  return (
    <nav className="navbar">
      <ul className="nav-links">
        <li>
          <Link to="/"><FaHome /> Home</Link>
        </li>
        <li>
          <Link to="/appointment-wizard"><FaCalendarAlt /> Appointments Booking</Link>
        </li>
        <li>
          <Link to="/appointments"><FaHistory /> Appointment History</Link>
        </li>
        <li>
          <Link to="/notifications"><FaBell /> Notifications</Link>
        </li>
      </ul>

      <div className="navbar-right">
        <div className="profile" onClick={() => setDropdownOpen(!dropdownOpen)}>
          <FaUserCircle className="profile-icon" />
          <span className="profile-name">{userName}</span>
        </div>
        {dropdownOpen && (
          <div className="dropdown">
            <Link to="/profile">My Profile</Link>
            <Link to="/logout">Logout</Link>
          </div>
        )}
      </div>
    </nav>
  );
}

export default VisitorNavbar;
