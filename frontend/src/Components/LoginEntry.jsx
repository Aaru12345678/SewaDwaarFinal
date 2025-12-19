import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import bannerImg from "../assets/banner.jpg";
import sewadwaarEng from "../assets/sewadwaar-eng.png";
import sewadwaarMain from "../assets/SewadwaarLogo1.png";
import govLogo from "../assets/emblem.png";
import loginBg from "../assets/loginimage.png";

import "../css/LoginEntry.css";

export default function LoginEntry() {
  const [showModal, setShowModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);

  const navigate = useNavigate();

  // Set login background
  useEffect(() => {
    document.body.style.background = `url(${loginBg}) no-repeat center center fixed`;
    document.body.style.backgroundSize = "cover";
    return () => (document.body.style.background = "");
  }, []);

  const openContinue = () => {
    if (!selectedRole) return;
    navigate(`/login/${selectedRole}`);
    setShowModal(false);
  };

  return (
    <>
      {/* HEADER */}
      <header className="gov-header">
        <div className="gov-left">
          <img src={govLogo} className="gov-emblem" alt="Emblem" />
          <div className="gov-text">
            <div className="gov-mh">महाराष्ट्र शासन</div>
            <div className="gov-en">Government of Maharashtra</div>
          </div>
        </div>

        <div className="gov-right">
          <span className="gov-font">A/A</span>
          <span className="gov-access">🛗</span>
        </div>
      </header>

      {/* MAIN SPLIT WRAPPER */}
      <div className="split-wrapper">
        <div className="left-banner">
          <img src={bannerImg} className="banner-img" alt="" />
        </div>

        <div className="right-panel">
          <div className="form-card">
            <div className="brand-block">
              <img src={sewadwaarEng} className="sd-eng-logo" alt="" />
              <img src={sewadwaarMain} className="sd-marathi-logo" alt="" />
            </div>

            <h2 className="form-title">Welcome to SewaDwaar</h2>
            <p className="form-sub">A single gateway to government services</p>

            <div className="action-row">
              <button className="btn-primary" onClick={() => setShowModal(true)}>
                Login
              </button>
              <button className="btn-secondary" onClick={() => navigate("/about")}>
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Select Login Type</h2>

            <div className="modal-grid">
              {/* Officer */}
              <div
                className={`modal-tile ${selectedRole === "officerlogin" ? "active" : ""}`}
                onClick={() => setSelectedRole("officerlogin")}
              >
                <div className="tile-title">Employee / Staff Login</div>
                <div className="tile-sub">For Govt Employees</div>
              </div>

              {/* Admin */}
              <div
                className={`modal-tile ${selectedRole === "adminlogin" ? "active" : ""}`}
                onClick={() => setSelectedRole("adminlogin")}
              >
                <div className="tile-title">Admin</div>
                <div className="tile-sub">Admin & Management</div>
              </div>

              {/* Visitor */}
              <div
                className={`modal-tile ${selectedRole === "visitorlogin" ? "active" : ""}`}
                onClick={() => setSelectedRole("visitorlogin")}
              >
                <div className="tile-title">Citizen / Visitor Login</div>
                <div className="tile-sub">For Citizens & Visitors</div>
              </div>

              {/* Helpdesk */}
              <div
                className={`modal-tile ${selectedRole === "helpdesklogin" ? "active" : ""}`}
                onClick={() => setSelectedRole("helpdesklogin")}
              >
                <div className="tile-title">Helpdesk Support Login</div>
                <div className="tile-sub">Support & Assistance</div>
              </div>
            </div>

            <div className="modal-actions">
              <button className="modal-cancel" onClick={() => setShowModal(false)}>
                Cancel
              </button>

              <button
                className={`modal-continue ${selectedRole ? "enabled" : ""}`}
                onClick={openContinue}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}