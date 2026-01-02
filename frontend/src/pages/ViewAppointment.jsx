import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../css/viewAppointment.css";

const ViewAppointment = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const appointment = state?.appointment;

  if (!appointment) {
    return <p className="no-data">No appointment data found</p>;
  }

  return (
    <div className="view-page">
      <h2 className="page-title">Appointment Details</h2>

      {/* CENTERED, LIMITED WIDTH CARD */}
      <div className="details-wrapper">
        <div className="details-grid">

          <div className="detail-box">
            <span className="label">Visitor Name</span>
            <span className="value">{appointment.visitor_name}</span>
          </div>

          <div className="detail-box">
            <span className="label">Appointment Date</span>
            <span className="value">{appointment.appointment_date}</span>
          </div>

          <div className="detail-box">
            <span className="label">Time Slot</span>
            <span className="value">{appointment.slot_time}</span>
          </div>

          <div className="detail-box">
            <span className="label">Officer</span>
            <span className="value">
              {appointment.officer_name || "Helpdesk"}
            </span>
          </div>

          {/* STATUS – FULL ROW */}
          <div className="detail-box status-row">
            <span className="label">Status</span>
            <span className={`status-badge ${appointment.status}`}>
              {appointment.status}
            </span>
          </div>

        </div>
      </div>

      <div className="action-bar">
        <button className="btn-back" onClick={() => navigate(-1)}>
          ← Back to Appointments
        </button>
      </div>
    </div>
  );
};

export default ViewAppointment;
