import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../css/VisitorDashboard.css";
import { getVisitorDashboard } from "../services/api";
import VisitorNavbar from "./VisitorNavbar";
// import Header from '../Components/Header';
// import NavbarMain from '../Components/NavbarMain';
// import Footer from '../Components/Footer';
// import './MainPage.css';
// import NavbarTop from '../Components/NavbarTop';

import Header from '../Components/Header';
import NavbarMain from '../Components/NavbarMain';
import Footer from '../Components/Footer';
import './MainPage.css';
import NavbarTop from '../Components/NavbarTop';


const VisitorDashboard = () => {
  const navigate = useNavigate();
  const username = localStorage.getItem("username");

  const [fullName, setFullName] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!username) {
      navigate("/login");
      return;
    }

    const fetchDashboard = async () => {
      try {
        setLoading(true);

        const { data, error } = await getVisitorDashboard(username);

        if (error || !data?.success) {
          console.error("Failed to load dashboard data", error);
          return;
        }

        setFullName(data.data.full_name || username);
        setAppointments(data.data.appointments || []);

        setNotifications(
          (data.data.notifications || []).map((n) => ({
            ...n,
            type: n.status ? n.status.toLowerCase() : "info",
            created_at: n.created_at ? new Date(n.created_at) : new Date(),
          }))
        );
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [username, navigate]);

  const handleView = (id) => navigate(`/appointment/${id}`);

  if (loading) return <p>Loading dashboard...</p>;

  const totalCount = appointments.length;
  const upcomingCount = appointments.filter(a => a.status.toLowerCase() === "approved").length;
  const pendingCount = appointments.filter(a => a.status.toLowerCase() === "pending").length;
  const completedCount = appointments.filter(a => a.status.toLowerCase() === "completed").length;
  const cancelledCount = appointments.filter(
    a => ["rejected", "cancelled"].includes(a.status.toLowerCase())
  ).length;

  return (
    <>
    <div className="fixed-header">
        <NavbarTop/>
        <Header />
      <VisitorNavbar fullName={fullName} />
        
      </div>
<div className="main-layout">
  <div className="content-below">
      <div className="dashboard-container">
        <div className="dashboard-inner">
          <h2 className="welcome">👋 Welcome, {fullName || username}</h2>
          <p className="intro">
            Here’s a summary of your appointments and notifications.
          </p>

          {/* Cards */}
          <div className="cards">
            <div className="card total"><h3>Total</h3><p className="count">{totalCount}</p></div>
            <div className="card upcoming"><h3>Upcoming</h3><p className="count">{upcomingCount}</p></div>
            <div className="card pending"><h3>Pending</h3><p className="count">{pendingCount}</p></div>
            <div className="card completed"><h3>Completed</h3><p className="count">{completedCount}</p></div>
            <div className="card cancelled"><h3>Cancelled / Rejected</h3><p className="count">{cancelledCount}</p></div>
            {/* <div className="card notifications"><h3>Notifications</h3><p className="count">{notifications.length}</p></div> */}
          </div>

          <Link to="/appointment-wizard">
            <button className="book-btn">📅 Book New Appointment</button>
          </Link>

          {/* Appointments */}
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
                    <td colSpan="7" className="no-data">No appointments found.</td>
                  </tr>
                ) : (
                  appointments.map(appt => (
                    <tr key={appt.appointment_id}>
                      <td>{appt.appointment_id}</td>
                     <td>{appt.officer_name}</td>
                      <td>{appt.department_name || "Search by service"}</td>
                      <td>{appt.service_name}</td>
                      <td>{appt.appointment_date} {appt.slot_time}</td>
                      <td className={`status ${appt.status.toLowerCase()}`}>{appt.status}</td>
                      <td>
                        <button
                          className="view-btn"
                          onClick={() => handleView(appt.appointment_id)}
                          // disabled={["cancelled", "rejected"].includes(appt.status.toLowerCase())}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Notifications */}
          <div className="notifications">
            <h3>🔔 Notifications</h3>
            {notifications.length === 0 ? (
              <p className="empty">No notifications yet.</p>
            ) : (
              <ul className="notification-list">
                {notifications.map((note, i) => (
                  <li key={i} className={`notification ${note.type}`}>
                    <p>{note.message}</p>
                    <span className="notif-time">
                      {note.created_at.toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

        </div>
      </div>
      </div>
      </div>
    </>
      
  );
};

export default VisitorDashboard;
