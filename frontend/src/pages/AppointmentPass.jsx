import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import "../css/AppointmentPass.css";
import VisitorNavbar from "./VisitorNavbar";
import { getVisitorDashboard } from "../services/api";

const AppointmentPass = () => {
  const { id } = useParams();
  const navigate = useNavigate(); // 👈 added

  const username = localStorage.getItem("username");

  const [fullName, setFullName] = useState("");
  const [appointmentDetails, setAppointmentDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [visitorImage, setVisitorImage] = useState(null);

  // ============================
  // Fetch user info for Navbar
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
  // Fetch appointment pass data
  // ============================
  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/appointments/${id}`
        );
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || "Failed to fetch appointment");
        }

        setAppointmentDetails(result.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointment();
  }, [id]);

  const handleImageCapture = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVisitorImage(URL.createObjectURL(file));
    }
  };

  if (loading) return <p className="loading">Loading appointment pass...</p>;
  if (error) return <p className="error">{error}</p>;
  if (!appointmentDetails) return <p>No appointment details found.</p>;

  const status = appointmentDetails.status?.toLowerCase();
  const isApproved = status === "approved";
  const isCancelled = status === "cancelled" || status === "rejected";

  const appointmentDateTime = `${new Date(
    appointmentDetails.appointment_date
  ).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })} ${appointmentDetails.slot_time?.slice(0, 5)}`;

  return (
    <div>
      {/* NAVBAR */}
      <VisitorNavbar fullName={fullName} />

      <div className="pass-container">
        <h2>📄 Appointment Pass</h2>

        <div className={`details-card ${isCancelled ? "cancelled" : ""}`}>
          <div className="details-card-row">
            <strong>Appointment ID:</strong>
            <span className={isCancelled ? "cancelled-label" : ""}>
              {appointmentDetails.appointment_id}
            </span>
          </div>

          <div className="details-card-row">
            <strong>Visitor Name:</strong>{" "}
            {appointmentDetails.visitor_name || fullName || "N/A"}
          </div>

          <div className="details-card-row">
            <strong>Appointment Date / Time:</strong> {appointmentDateTime}
          </div>

          <div className="details-card-row">
            <strong>Officer Name:</strong>{" "}
            {appointmentDetails.officer_name || "N/A"}
          </div>

          <div className="details-card-row">
            <strong>Department:</strong>{" "}
            {appointmentDetails.department_name || "N/A"}
          </div>

          {/* QR Code */}
          {isApproved && (
            <div className="details-card-row full-width">
              <div className="qr-code">
                <QRCodeSVG
                  value={JSON.stringify({
                    appointment_id: appointmentDetails.appointment_id,
                    visitor_id: appointmentDetails.visitor_id,
                    officer_id: appointmentDetails.officer_id,
                  })}
                  size={150}
                />
                <p>Scan QR for Check-in</p>
              </div>
            </div>
          )}

          {/* Image Capture */}
          {isApproved && (
            <div className="details-card-row full-width">
              <div className="image-capture">
                <p>Click below to verify yourself:</p>
                <input
                  type="file"
                  accept="image/*"
                  capture="user"
                  onChange={handleImageCapture}
                />
                {visitorImage && (
                  <div className="preview">
                    <p>Captured Image:</p>
                    <img src={visitorImage} alt="Visitor Capture" />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Cancelled Message */}
          {isCancelled && (
            <div className="details-card-row full-width">
              <p className="cancelled-msg">
                This appointment has been CANCELLED.
              </p>
            </div>
          )}

          {/* Pending / Other Status */}
          {!isApproved && !isCancelled && (
            <div className="details-card-row full-width">
              <p className="status-msg">
                QR code and verification will be available once the appointment is approved.
              </p>
            </div>
          )}

          {/* 🔙 Back Button */}
          <div className="details-card-row full-width" style={{ textAlign: "center" }}>
            <button
              className="back-btn"
              onClick={() => navigate(-1)}
            >
              ← Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentPass;
