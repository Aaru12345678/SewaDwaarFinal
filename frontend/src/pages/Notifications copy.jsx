import React, { useState } from "react";
import "../css/Dashboard.css";

function Notifications() {
  const [notifications] = useState([
    { id: 1, type: "success", text: "Visitor checked in successfully." },
    { id: 2, type: "info", text: "Appointment rescheduled by visitor." },
    { id: 3, type: "warning", text: "Visitor did not show up." },
  ]);

  return (
    <div className="dashboard-container">
      <div className="dashboard-inner">
        <h2>Notifications</h2>
        <div className="notifications">
          <ul className="notification-list">
            {notifications.map(note => (
              <li key={note.id} className={`notification ${note.type}`}>
                {note.text}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Notifications;
