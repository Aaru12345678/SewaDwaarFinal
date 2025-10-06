import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/emblem.png";
import "../css/LoginEntry.css";
import officer from './OfficerLogin';

export default function LoginEntry() {
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const firstRoleRef = useRef(null);

  const openRole = (role) => {
    setShowModal(false);
    navigate(`/login/${role}`);
  };

  // open modal & set focus to first button
  useEffect(() => {
    if (showModal) {
      // prevent background scroll
      document.body.style.overflow = "hidden";
      setTimeout(() => {
        firstRoleRef.current?.focus();
      }, 50);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showModal]);

  // close on ESC
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && showModal) setShowModal(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showModal]);

  const OfficerLogin = () => {
    navigate("/OfficerLogin");
  };



  return (
    <div className="login-page">
      <header className="le-header">
        <div className="le-header-inner">
          <img src={logo} alt="Emblem" className="le-logo" />
          <div className="le-gov-text">
            <div className="le-hindi">महाराष्ट्र शासन</div>
            <div className="le-english">Government of Maharashtra</div>
          </div>
        </div>
      </header>

      <main className="le-main">
        <section className="le-card">
          <h1 className="le-title">Welcome to SewaDwaar</h1>
          <p className="le-sub">
            A single gateway to connect citizens with government services.
          </p>

          <div className="le-actions">
            <button
              className="le-primary"
              onClick={() => setShowModal(true)}
              aria-haspopup="dialog"
              aria-controls="role-modal"
            >
              Login
            </button>

            <button
              className="le-secondary"
              onClick={() => navigate("/about")}
              title="Learn more about SewaDwaar"
            >
              Learn more
            </button>
          </div>
        </section>
      </main>

      {showModal && (
        <div
          className="role-modal"
          role="dialog"
          aria-modal="true"
          id="role-modal"
          onClick={() => setShowModal(false)}
        >
          <div
            className="role-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="role-heading">Select Login Type</h2>

            <div className="role-grid" role="group" aria-label="Login types">
              <button
                ref={firstRoleRef}
                className="role-btn"
                onClick={(OfficerLogin)}
              >
                Officer
                <span className="role-desc">Employee / Staff Login</span>
              </button>

              <button
                className="role-btn"
                onClick={() => openRole("admin")}
              >
                Admin
                <span className="role-desc">Admin & Management</span>
              </button>

              <button
                className="role-btn"
                onClick={() => openRole("visitorlogin")}
              >
                Visitor
                <span className="role-desc">Citizen / Visitor Login</span>
              </button>
            </div>

            <div className="role-actions">
              <button
                className="role-cancel"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="le-footer">
        <small>© {new Date().getFullYear()} SewaDwaar — All rights reserved</small>
      </footer>
    </div>
  );
}
