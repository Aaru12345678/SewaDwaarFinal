import React, { useEffect, useState } from "react";
import "../css/Notifications.css";
import { getVisitorDashboard } from "../services/api";
import VisitorNavbar from "./VisitorNavbar"; // ✅ import navbar

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const username = localStorage.getItem("username"); 
   const [fullName, setFullName] = useState("");

  useEffect(() => {
    if (!username) return;

    const fetchNotifications = async () => {
      setLoading(true);
      const { data, error } = await getVisitorDashboard(username);

      if (error) {
        alert("Failed to fetch notifications");
      } else if (data && data.success) {
        setFullName(data.data.full_name || username);
        // Map notifications to include type for CSS
        setNotifications(
          (data.data.notifications || []).map((n) => ({
            ...n,
            type: n.status.toLowerCase(),
            created_at: n.created_at || new Date(),
          }))
        );
      }
      setLoading(false);
    };

    fetchNotifications();
  }, [username]);

  if (loading) return <p>Loading notifications...</p>;

  return (
    <div>
      {/* ✅ Add VisitorNavbar */}
        <VisitorNavbar fullName={fullName} />

      <div className="notifications-container">
        <h2>🔔 Notifications</h2>
        {notifications.length === 0 ? (
          <p className="empty">No notifications yet.</p>
        ) : (
          <ul className="notification-list">
            {notifications.map((note, index) => (
              <li key={index} className={`notification ${note.type}`}>
                <p>{note.message}</p>
                <span className="time">
                  {new Date(note.created_at).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Notifications;
