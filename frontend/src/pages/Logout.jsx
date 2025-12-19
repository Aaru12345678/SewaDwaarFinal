import React ,{useEffect,useState,} from "react";
import { useNavigate } from "react-router-dom";
import "../css/Logout.css";
import logo from "../assets/logo.png"; // ✅ your image path
import { toast } from "react-toastify";

const Logout = () => {
  const navigate = useNavigate();
  const [username,setUsername]=useState();
  const handleReturn = () => {
    navigate("/login");
  };

  // useEffect(()=>{if (!username) {
  //       toast.error("Please log in first");
  //       // navigate("/login");
  //       return;}},[username])

  return (
    <div className="logout-page fade-in">
      {/* Header Section */}
      <header className="logout-header fade-in-delay">
        <img src={logo} alt="Government Emblem" className="emblem" />
        <div className="header-text">
          <h2>Digital Appointment Management System</h2>
          <p>Government of India</p>
        </div>
      </header>

      {/* Logout Box */}
      <div className="logout-box fade-in-delay">
        <h3>
          <span className="lock-icon">🔒</span> You have been securely logged out
        </h3>
        <p>
          Thank you for using the Digital Appointment Management Portal.
          <br />
          Your session has ended for security reasons.
        </p>
        <button className="return-btn" onClick={handleReturn}>
          Return to Login Page
        </button>
      </div>
    </div>
  );
};

export default Logout;
