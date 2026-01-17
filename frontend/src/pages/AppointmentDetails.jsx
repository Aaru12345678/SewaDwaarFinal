import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../css/AppointmentDetails.css";
import { getVisitorDashboard } from "../services/api";
import VisitorNavbar from "./VisitorNavbar";
import NavbarTop from '../Components/NavbarTop';
import Header from '../Components/Header';
import './MainPage.css';

const AppointmentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const username = localStorage.getItem("username");

  const [fullName, setFullName] = useState("");
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ============================
  // Fetch Navbar User Info
  // ============================
  useEffect(() => {
    const fetchUser = async () => {
      if (!username) return;

      const { data } = await getVisitorDashboard(username);
      if (data?.success) {
        setFullName(data.data.full_name || username);
      }
    };

    fetchUser();
  }, [username]);

  // ============================
  // Fetch Appointment Details
  // ============================
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

  const status = appointment.status.toLowerCase();

const isCancelled = status === "cancelled";
const isRejected = status === "rejected";
const isRescheduled = status === "rescheduled";
const isCompleted = status === "completed";


  return (
    <>
      {/* NAVBAR */}
      <div className="fixed-header">
        <NavbarTop/>
        <Header />
      <VisitorNavbar fullName={fullName} />
        
      </div>
      <div className="main-layout">
  <div className="content-below">

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
          {/* STATUS INFO */}
<h3 className="section-title">Status Information</h3>
<div className="status-container">
  <span className={`status-badge ${status}`}>
    {appointment.status.toUpperCase()}
  </span>

  {/* NORMAL FLOW (Pending → Approved → Completed) */}
  {!isCancelled && !isRejected && !isRescheduled && (
    <div className="status-timeline">
      <div className="timeline-step active">
        <div className="circle"></div>
        <span>Pending</span>
      </div>

      <div className={`timeline-step ${status !== "pending" ? "active" : ""}`}>
        <div className="circle"></div>
        <span>Approved</span>
      </div>

      <div className={`timeline-step ${isCompleted ? "active" : ""}`}>
        <div className="circle"></div>
        <span>Completed</span>
      </div>
    </div>
  )}

  {/* ❌ CANCELLED */}
  {isCancelled && (
    <div className="cancelled-info">
      <p className="cancelled-msg">
        This appointment has been cancelled.
      </p>
      {appointment.cancelled_reason && (
        <p className="cancelled-reason">
          <strong>Reason:</strong> {appointment.cancelled_reason}
        </p>
      )}
    </div>
  )}

  {/* ❌ REJECTED */}
  {isRejected && (
    <div className="cancelled-info">
      <p className="cancelled-msg">
        This appointment has been rejected.
      </p>
      {appointment.reschedule_reason && (
        <p className="cancelled-reason">
          <strong>Reason:</strong> {appointment.reschedule_reason}
        </p>
      )}
    </div>
  )}

  {/* 🔁 RESCHEDULED */}
  {isRescheduled && (
    <div className="cancelled-info">
      <p className="cancelled-msg">
        This appointment has been rescheduled.
      </p>
      {appointment.reschedule_reason && (
        <p className="cancelled-reason">
          <strong>Reschedule Reason:</strong> {appointment.reschedule_reason}
        </p>
      )}
    </div>
  )}

  {/* ✅ COMPLETED */}
  {isCompleted && appointment.reschedule_reason && (
    <div className="completed-info">
      <p className="completed-msg">
        This appointment has been completed.
      </p>
      <p className="completed-remark">
        <strong>Remark:</strong> {appointment.reschedule_reason}
      </p>
    </div>
  )}
</div>


          {/* ACTIONS */}
          <div className="action-section">
            {/* Always show back button */}
            <div className="action-buttons">
              <button className="back-btn" onClick={() => navigate(-1)}>
                ← Back
              </button>

              {/* Only show print button if not cancelled */}
              {!isCancelled && (
                <button className="print-btn" onClick={() => window.print()}>
                  🖨 Print Slip
                </button>
              )}
            </div>

            {/* QR section only if not cancelled */}
            {/* {!isCancelled && (
              <div className="qr-box">
                <p>Appointment QR</p>
                <div className="qr-placeholder">QR</div>
              </div>
            )} */}
          </div>

        </div>
      </div>
      </div>
      </div>
    </>
  );
};

export default AppointmentDetails;
