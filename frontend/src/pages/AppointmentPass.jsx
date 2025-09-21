import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import "./css/AppointmentPass.css";

const AppointmentPass = () => {
  const { id } = useParams();  // ✅ Get ID from URL
  const [visitorImage, setVisitorImage] = useState(null);

  // Later: fetch from backend using id
  const appointmentDetails = {
    id,
    visitorName: "Ravi Tambe",
    appointmentDateTime: "2025-09-16 10:30 AM",
    officerName: "John Doe",
    department: "IT Department",
  };

  const handleImageCapture = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVisitorImage(URL.createObjectURL(file));
    }
  };

  return (
    <div className="pass-container">
      <h2>📄 Appointment Pass</h2>
      <div className="details-card">
        <p><strong>Appointment ID:</strong> {appointmentDetails.id}</p>
        <p><strong>Visitor Name:</strong> {appointmentDetails.visitorName}</p>
        <p><strong>Appointment Date/Time:</strong> {appointmentDetails.appointmentDateTime}</p>
        <p><strong>Officer Name:</strong> {appointmentDetails.officerName}</p>
        <p><strong>Department:</strong> {appointmentDetails.department}</p>

        <div className="qr-code">
          <QRCodeSVG value={JSON.stringify(appointmentDetails)} size={150} />
          <p>Scan QR for Check-in</p>
        </div>

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
    </div>
  );
};

export default AppointmentPass;
