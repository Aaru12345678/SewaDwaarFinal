import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../css/AppointmentDetails.css";

const AppointmentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAppointmentDetails = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/appointments/${id}`
        );
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.message || "Failed to fetch details");
        }
        setAppointment(result.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointmentDetails();
  }, [id]);

  if (loading) return <p className="loading">Loading appointment details...</p>;
  if (error) return <p className="error">{error}</p>;

  const isCancelled = appointment.status.toLowerCase() === "cancelled";

  return (
    <div className="appointment-page">
      <div className="appointment-card">

        {/* Header */}
        <div className="card-header">
          <h2>Appointment Details</h2>
          <span className={`appt-id ${isCancelled ? "cancelled-label" : ""}`}>
            ID: {appointment.appointment_id}
          </span>
        </div>

        {/* BASIC INFO */}
        <h3 className="section-title">Basic Information</h3>
        <div className="details-grid">
          <div className="detail-item">
            <span className="label">Officer</span>
            <span className="value">{appointment.officer_name}</span>
          </div>
          <div className="detail-item">
            <span className="label">Department</span>
            <span className="value">{appointment.department_name}</span>
          </div>
          <div className="detail-item">
            <span className="label">Organization</span>
            <span className="value">{appointment.organization_name}</span>
          </div>
          <div className="detail-item">
            <span className="label">Service</span>
            <span className="value">{appointment.service_name}</span>
          </div>
        </div>

        {/* SCHEDULE INFO */}
        <h3 className="section-title">Schedule Details</h3>
        <div className="details-grid">
          <div className="detail-item">
            <span className="label">Appointment Date</span>
            <span className="value">
              {new Date(appointment.appointment_date).toLocaleDateString("en-IN")}
            </span>
          </div>
          <div className="detail-item">
            <span className="label">Time Slot</span>
            <span className="value">{appointment.slot_time}</span>
          </div>
        </div>

        {/* STATUS INFO */}
        <h3 className="section-title">Status Information</h3>
        <div className="status-container">
          <span className={`status-badge ${appointment.status.toLowerCase()}`}>
            {appointment.status.toUpperCase()}
          </span>

          {!isCancelled && (
            <div className="status-timeline">
              <div className={`timeline-step active`}>
                <div className="circle"></div>
                <span>Pending</span>
              </div>
              <div
                className={`timeline-step ${
                  appointment.status !== "pending" ? "active" : ""
                }`}
              >
                <div className="circle"></div>
                <span>Approved</span>
              </div>
              <div
                className={`timeline-step ${
                  appointment.status === "completed" ? "active" : ""
                }`}
              >
                <div className="circle"></div>
                <span>Completed</span>
              </div>
            </div>
          )}

          {isCancelled && (
            <p className="cancelled-msg">This appointment has been cancelled.</p>
          )}
        </div>

        {/* QR + ACTIONS */}
        {!isCancelled && (
          <div className="action-section">
            <div className="qr-box">
              <p>Appointment QR</p>
              <div className="qr-placeholder">QR</div>
            </div>
            <div className="action-buttons">
              <button className="back-btn" onClick={() => navigate(-1)}>
                ← Back
              </button>
              <button className="print-btn" onClick={() => window.print()}>
                🖨 Print Slip
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AppointmentDetails;
