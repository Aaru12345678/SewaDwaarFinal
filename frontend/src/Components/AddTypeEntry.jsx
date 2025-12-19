import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../css/AddTypeEntry.css";

export default function AddTypeEntry() {
  const [showModal, setShowModal] = useState(true);
  const navigate = useNavigate();
  const firstRef = useRef(null);

  const openType = (type) => {
    setShowModal(false);
    navigate(`/add/${type}`);
  };

  // Close on Esc key
  useEffect(() => {
    const escHandler = (e) => {
      if (e.key === "Escape") setShowModal(false);
    };
    document.addEventListener("keydown", escHandler);
    return () => document.removeEventListener("keydown", escHandler);
  }, []);

  // Body scroll lock
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = "hidden";
      setTimeout(() => {
        firstRef.current?.focus();
      }, 50);
    } else {
      document.body.style.overflow = "";
    }
  }, [showModal]);

  return (
    <>
      {showModal && (
        <div className="role-modal" onClick={() => setShowModal(false)}>
          <div
            className="role-modal-content role-fade-in"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <h2 className="role-heading">
              Government Entity Onboarding
            </h2>

            <p className="role-subtext">
              Please select the category you would like to register into the system.
            </p>

            <div className="role-grid">
              {/* ORGANIZATION */}
              <button
                ref={firstRef}
                className="role-btn"
                onClick={() => openType("organization")}
              >
                <span className="role-title">Organization</span>
                <span className="role-desc">Register a Government / Municipal Body</span>
              </button>

              {/* DEPARTMENT */}
              <button
                className="role-btn"
                onClick={() => openType("department")}
              >
                <span className="role-title">Department</span>
                <span className="role-desc">Add a Department Under an Organization</span>
              </button>

              {/* SERVICES */}
              <button
                className="role-btn"
                onClick={() => openType("services")}
              >
                <span className="role-title">Public Service</span>
                <span className="role-desc">Define Services Provided by a Department</span>
              </button>
            </div>

            <div className="role-actions">
              <button
                className="role-cancel"
                onClick={() => navigate(-1)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
