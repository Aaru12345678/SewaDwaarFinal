import React, { useEffect, useState } from "react";
import { Link,useNavigate } from "react-router-dom";
import "../css/Dashboard.css";
import { getVisitorDashboard } from "../services/api";
import VisitorNavbar from "./VisitorNavbar"; // ✅ import navbar
import { toast } from "react-toastify";

function OfficerDashboard() {
    const navigate = useNavigate();
  
  const [stats, setStats] = useState({
    today: 3,
    pending: 5,
    completed: 12,
  });
   const [fullName, setFullName] = useState("");
   const [notifications, setNotifications] = useState([]);
     const [loading, setLoading] = useState(true);
     const username = localStorage.getItem("username"); 
useEffect(() => {
  if (!username) {
    toast.error("Please log in first");
    navigate("/login");
    return;
  }

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

  return (
    <>
        <VisitorNavbar fullName={fullName} />

    <div className="dashboard-container">
      <div className="dashboard-inner">
        <h1 className="welcome">Welcome Officer</h1>
        <p className="intro">Manage today’s appointments, walk-in requests, and notifications</p>

        {/* Cards */}
        <div className="cards">
          <Link to="/officer/today" className="card">
            <h3>Today’s Appointments</h3>
            <p>{stats.today}</p>
          </Link>

          <Link to="/officer/pending" className="card">
            <h3>Pending Requests</h3>
            <p>{stats.pending}</p>
          </Link>

          <Link to="/officer/history" className="card">
            <h3>Completed</h3>
            <p>{stats.completed}</p>
          </Link>
        </div>

        {/* Notifications Preview */}
        <div className="notifications">
          <h3>Latest Notifications</h3>
          <ul className="notification-list">
            <li className="notification success">Visitor check-in confirmed.</li>
            <li className="notification info">Appointment rescheduled for tomorrow.</li>
          </ul>
          <Link to="/officer/notifications" className="view-btn">View All</Link>
        </div>
      </div>
    </div>
    </>
  );
}

export default OfficerDashboard;
