import React from "react";
import { useNavigate } from "react-router-dom";
import "../css/Logout.css";
import logo from "../assets/sewaimage.png";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import NavbarMain from '../Components/NavbarMain';
import NavbarTop from '../Components/NavbarTop';
import VisitorNavbar from "./VisitorNavbar";

// import NavbarMain from "../Components/NavbarMain";

const Logout = () => {
  const navigate = useNavigate();

  const handleReturn = () => {
    navigate("/login");
  };

  return (
    <>
    <div className="fixed-header">
        <NavbarTop/>
        <Header />
        <NavbarMain/>
        
      </div>
      <div className="main-layout">
  <div className="content-below">
    <div className="logout-page fade-in">
      {/* Header Section */}
      <header className="logout-header fade-in-delay">
        <img src={logo} alt="Government Emblem" className="emblem" />
        <div className="header-text">
          <h2>SevaDwaar Appointment Booking Portal</h2>
          <p>Government of India</p>
        </div>
      </header>

      {/* Logout Box */}
      <div className="logout-box fade-in-delay">
        <h3>
          <span className="lock-icon">🔒</span> You have been securely logged out
        </h3>

        <p>
          Thank you for using the Visitor Appointment Management Portal.
          <br />
          For security reasons, your session has been successfully terminated.
        </p>

        <button className="return-btn" onClick={handleReturn}>
          Return to Login Page
        </button>
      </div>
    </div>
    </div>
    </div>
    </>
  );
};

export default Logout;
