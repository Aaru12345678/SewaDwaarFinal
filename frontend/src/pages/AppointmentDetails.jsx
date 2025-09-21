// src/pages/AppointmentDetails.jsx
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./AppointmentDetails.css";
const AppointmentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="appointment-details">
      <h2>📄 Appointment Details</h2>
      <p><strong>ID:</strong> {id}</p>
      {/* later: fetch details from backend by ID */}
      <p><strong>Officer:</strong> Example Officer</p>
      <p><strong>Department:</strong> Example Department</p>
      <p><strong>Date & Time:</strong> 20-Sep-25</p>
      <p><strong>Status:</strong> Accepted</p>

      <button onClick={() => navigate(-1)}>⬅ Back</button>
    </div>
  );
};

export default AppointmentDetails;
