// src/pages/Notifications.jsx
import React, { useState } from "react";
import "./css/Notifications.css";

const Notifications = () => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      message: "✅ Your appointment is accepted by Officer Sharma",
      time: "18-Sep-25, 3:00 PM",
      type: "success",
    },
    {
      id: 2,
      message: "⏰ Officer Patel suggested a new time: 20-Sep-25, 11:30 AM",
      time: "17-Sep-25, 5:45 PM",
      type: "info",
    },
  ]);

  return (
    <div className="notifications-container">
      <h2>🔔 Notifications</h2>
      {notifications.length === 0 ? (
        <p className="empty">No notifications yet.</p>
      ) : (
        <ul className="notification-list">
          {notifications.map((note) => (
            <li key={note.id} className={`notification ${note.type}`}>
              <p>{note.message}</p>
              <span className="time">{note.time}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Notifications;
