import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/walkins.css";

function WalkIns() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    visitorName: "",
    officer: "",
    department: "",
    purpose: "",
    date: new Date().toISOString().split("T")[0],
    time: "",
    idProof: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Walk-in submitted:", formData);
    alert("✅ Walk-in registered successfully!");
    navigate("/appointments"); // Redirect back to appointments
  };

  return (
    <div className="walkin-page">
      <h1>Walk-in Visitor Registration</h1>
      <p className="subtitle">
        Fill the details below to record a walk-in visitor at the organization.
      </p>

      <form onSubmit={handleSubmit} className="walkin-form">
        <div className="form-group">
          <label>Visitor Name:</label>
          <input
            type="text"
            name="visitorName"
            value={formData.visitorName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Department / Officer to Meet:</label>
          <input
            type="text"
            name="officer"
            value={formData.officer}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Purpose of Visit:</label>
          <textarea
            name="purpose"
            value={formData.purpose}
            onChange={handleChange}
            required
          ></textarea>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Date:</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Time:</label>
            <input
              type="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-group">
          <label>ID Proof (Optional):</label>
          <input
            type="text"
            name="idProof"
            placeholder="e.g., Aadhar, PAN, etc."
            value={formData.idProof}
            onChange={handleChange}
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="submit-btn">
            Register Walk-in
          </button>
          <button
            type="button"
            className="cancel-btn"
            onClick={() => navigate("/appointments")}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default WalkIns;
