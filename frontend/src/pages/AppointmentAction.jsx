import React, { useState } from "react";
import { useParams } from "react-router-dom";
import "../css/Dashboard.css";

function AppointmentAction() {
  const { id } = useParams();
  const [showModal, setShowModal] = useState(false);
  const [rescheduleDateTime, setRescheduleDateTime] = useState("");
  console.log(showModal)
  const handleAction = (type) => {
    console.log(type)
    if (type === "rescheduled" && !rescheduleDateTime) {
      alert("⚠️ Please select a new date and time before saving.");
      return;
    }
    alert(`Appointment ${id} ${type} at ${rescheduleDateTime || "original time"}`);
    setShowModal(false);
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-inner">
        <h2>Appointment Details (ID: {id})</h2>
        <p><strong>Visitor:</strong> John Doe</p>
        <p><strong>Department:</strong> Revenue</p>
        <p><strong>Time:</strong> 10:00 AM</p>

        <div className="actions">
          <button className="approve" onClick={() => handleAction("approved")}>Approve</button>
          <button className="reject" onClick={() => handleAction("rejected")}>Reject</button>
          <button className="reschedule" onClick={() => setShowModal(true)}>Reschedule</button>
        </div>
      </div>

      {/* Modal (conditionally rendered) */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Reschedule Appointment</h3>
            <input
              type="datetime-local"
              value={rescheduleDateTime}
              onChange={(e) => setRescheduleDateTime(e.target.value)}
            />
            <div className="modal-actions">
              <button className="save" onClick={() => handleAction("rescheduled")}>Save</button>
              <button className="cancel" onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AppointmentAction;
