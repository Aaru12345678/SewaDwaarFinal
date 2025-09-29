import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../css/VisitorDashboard.css";
const VisitorDashboard = () => {
  const navigate = useNavigate();

  // Example appointment data
  const [appointments, setAppointments] = useState([
    { id: 101, officer: "Mr. Sharma", department: "Revenue", dateTime: "18-Sep-25", status: "Pending" },
    { id: 102, officer: "Ms. Patel", department: "Health", dateTime: "19-Sep-25", status: "Accepted" },
    { id: 103, officer: "Mr. Singh", department: "Education", dateTime: "15-Sep-25", status: "Completed" },
    { id: 104, officer: "Mr. Verma", department: "IT", dateTime: "14-Sep-25", status: "Cancelled" },
  ]);

  // Example notifications
  const [notifications] = useState([
    { id: 1, message: "✅ Your appointment is accepted by Officer Sharma", type: "success" },
    { id: 2, message: "⏰ Officer Patel suggested a new time: 20-Sep-25, 11:30 AM", type: "info" },
  ]);

  // Dashboard cards
  const upcomingCount = appointments.filter(a => a.status === "Pending" || a.status === "Accepted").length;
  const pendingCount = appointments.filter(a => a.status === "Pending").length;
  const completedCount = appointments.filter(a => a.status === "Completed").length;
  const cancelledCount = appointments.filter(a => a.status === "Cancelled").length;

  const unreadNotifications = notifications.length;

  const handleView = (id) => navigate(`/appointment/${id}`);

  return (
    <div className="dashboard-container">
      <div className="dashboard-inner">
        {/* Welcome */}
        <h2 className="welcome">👋 Welcome, Ravi!</h2>
        <p className="intro">Here’s a summary of your appointments and notifications.</p>

        {/* Dashboard Cards */}
        <div className="cards">
           <div className="card">
            <h3>Total</h3>
            <p className="count"> {upcomingCount + pendingCount + completedCount + cancelledCount}</p>
           </div>
          <div className="card">
            <h3>Upcoming Appointments</h3>
            <p className="count">{upcomingCount}</p>
          </div>
          <div className="card">
            <h3>Pending Requests</h3>
            <p className="count">{pendingCount}</p>
          </div>
          <div className="card">
            <h3>Completed Visits</h3>
            <p className="count">{completedCount}</p>
          </div>
          <div className="card">
            <h3>Cancelled / Rejected</h3>
            <p className="count">{cancelledCount}</p>
          </div>
          <div className="card">
            <h3>Unread Notifications</h3>
            <p className="count">{unreadNotifications}</p>
          </div>
        </div>

        {/* Book New Appointment */}
        <Link to="/appointment-wizard">
          <button className="book-btn">Book New Appointment</button>
        </Link>

        {/* Appointments Table */}
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Officer</th>
                <th>Department</th>
                <th>Date & Time</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.length === 0 ? (
                <tr>
                  <td colSpan="6" className="no-data">
                    No appointments found. Click 'Book New Appointment' to get started.
                  </td>
                </tr>
              ) : (
                appointments.map(appt => (
                  <tr key={appt.id}>
                    <td>{appt.id}</td>
                    <td>{appt.officer}</td>
                    <td>{appt.department}</td>
                    <td>{appt.dateTime}</td>
                    <td className={`status ${appt.status.toLowerCase()}`}>{appt.status}</td>
                    <td>
                      <button className="view-btn" onClick={() => handleView(appt.id)}>View</button>
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
              {notifications.map(note => (
                <li key={note.id} className={`notification ${note.type}`}>
                  <p>{note.message}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default VisitorDashboard;
