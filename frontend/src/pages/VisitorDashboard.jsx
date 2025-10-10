import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../css/VisitorDashboard.css";
import { toast } from "react-toastify";
import { getVisitorDashboard } from "../services/api";
import VisitorNavbar from "./VisitorNavbar"; // ✅ Import navbar

const VisitorDashboard = () => {
  const navigate = useNavigate();
  const username = localStorage.getItem("username"); // visitor_id and username are the same
  const [fullName, setFullName] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  if (!username) {
    toast.error("Please log in first");
    navigate("/login");
    return;
  }

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const { data, error } = await getVisitorDashboard(username);

      if (error) {
        toast.error("Unable to fetch dashboard data");
        console.error(error);
        return;
      }

      if (data && data.success) {
  setFullName(data.data.full_name || username); // already done
  setAppointments(data.data.appointments || []);
  setNotifications(
    data.data.notifications.map((n) => ({
      ...n,
      type: n.status.toLowerCase(),
      created_at: n.created_at || new Date(),
    }))
  );
} else {
        toast.error("Failed to load dashboard data");
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      toast.error("Unable to fetch dashboard data");
    } finally {
      setLoading(false);
    }
  };

  fetchDashboard();
}, [username, navigate]);

  const handleView = (id) => navigate(`/appointment/${id}`);

  if (loading) return <p>Loading dashboard...</p>;

  // Summary counts
  const totalCount = appointments.length;
  const upcomingCount = appointments.filter((a) => a.status.toLowerCase() === "approved").length;
  const pendingCount = appointments.filter((a) => a.status.toLowerCase() === "pending").length;
  const completedCount = appointments.filter((a) => a.status.toLowerCase() === "completed").length;
  const cancelledCount = appointments.filter((a) => a.status.toLowerCase() === "rejected").length;
  const unreadNotifications = notifications.length;

  return (
    <div>
      {/* ✅ Add VisitorNavbar at the top */}
      <VisitorNavbar fullName={fullName} />


      <div className="dashboard-container">
        <div className="dashboard-inner">
          <h2 className="welcome">👋 Welcome, {fullName || username}</h2>
          <p className="intro">Here’s a summary of your appointments and notifications.</p>

          {/* Cards */}
          <div className="cards">
            <div className="card total">
              <h3>Total</h3>
              <p className="count">{totalCount}</p>
            </div>
            <div className="card upcoming">
              <h3>Upcoming</h3>
              <p className="count">{upcomingCount}</p>
            </div>
            <div className="card pending">
              <h3>Pending</h3>
              <p className="count">{pendingCount}</p>
            </div>
            <div className="card completed">
              <h3>Completed</h3>
              <p className="count">{completedCount}</p>
            </div>
            <div className="card cancelled">
              <h3>Cancelled / Rejected</h3>
              <p className="count">{cancelledCount}</p>
            </div>
            <div className="card notifications">
              <h3>Notifications</h3>
              <p className="count">{unreadNotifications}</p>
            </div>
          </div>

          {/* Book New Appointment */}
          <Link to="/appointment-wizard">
            <button className="book-btn">📅 Book New Appointment</button>
          </Link>

          {/* Appointments Table */}
          <div className="table-container">
            <h3>🗓️ Your Appointments</h3>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Officer</th>
                  <th>Department</th>
                  <th>Service</th>
                  <th>Date & Time</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {appointments.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="no-data">
                      No appointments found.
                    </td>
                  </tr>
                ) : (
                  appointments.map((appt) => (
                    <tr key={appt.appointment_id}>
                      <td>{appt.appointment_id}</td>
                      <td>{appt.officer_name}</td>
                      <td>{appt.department_name}</td>
                      <td>{appt.service_name}</td>
                      <td>
                        {appt.appointment_date} {appt.slot_time}
                      </td>
                      <td className={`status ${appt.status.toLowerCase()}`}>{appt.status}</td>
                      <td>
                        <button className="view-btn" onClick={() => handleView(appt.appointment_id)}>
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Notifications List */}
          <div className="notifications">
            <h3>🔔 Notifications</h3>
            {notifications.length === 0 ? (
              <p className="empty">No notifications yet.</p>
            ) : (
              <ul className="notification-list">
                {notifications.map((note, index) => (
                  <li key={index} className={`notification ${note.type}`}>
                    <p>{note.message}</p>
                    <span className="notif-time">
                      {new Date(note.created_at).toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisitorDashboard;
