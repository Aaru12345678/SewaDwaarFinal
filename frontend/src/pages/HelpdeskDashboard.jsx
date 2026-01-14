import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import NavbarHelpdesk from "../pages/NavbarHelpdesk";
import SidebarHelpdesk from "../pages/SidebarHelpdesk";
import StatsRow from "./StatsRow";
import AppointmentList from "../pages/AppointmentHelpdesk";
import HelpdeskBooking from "../pages/HelpdeskBooking";
import HelpdeskAllAppointments from "../pages/HelpdeskAllAppointments";
import SearchUserByMobile from "../pages/SearchUserByMobile";
import {getHelpdeskDashboardCounts} from '../services/api'
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import "../css/HelpdeskDashboard.css";

const HelpdeskDashboard = () => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [showSearchUser, setShowSearchUser] = useState(false);

  const [showAppointmentList, setShowAppointmentList] = useState(false);
  const [showBooking, setShowBooking] = useState(false);
  const [showAllAppointments, setShowAllAppointments] = useState(false);
  const [filterType, setFilterType] = useState("");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
  today: 0,
  pending: 0,
  completed: 0,
  rejected: 0,
  rescheduled: 0,
  walkins: 0,
});

  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);

  const helpdeskId = localStorage.getItem("helpdesk_id");
  const username = localStorage.getItem("helpdesk_username");
  const locationId = localStorage.getItem("helpdesk_location");
  const state=localStorage.getItem("state")

 const officer=localStorage.getItem("username")
  console.log(officer,"officerID")

  // const officerId = localStorage.getItem("officer_id");

  useEffect(() => {
    if (!officer) {
      navigate("/login/helpdesklogin");
      return;
    }
  })


  // import { getHelpdeskDashboardCounts } from '@/api/api'; 
// adjust path if needed

const fetchDashboardData = useCallback(async () => {
  try {
    setLoading(true);

    console.log("HELPDESK ID USED 👉", officer);

    if (!officer) {
      console.error("❌ helpdeskId is missing");
      return;
    }

    const response = await getHelpdeskDashboardCounts(officer);
    console.log("RAW API RESPONSE 👉", response);

    const data = response?.data ?? response;
    console.log("FINAL DATA 👉", data);

    setStats({
  today: data.data.today_appointments,
  pending: data.data.pending_appointments,
  completed: data.data.completed_appointments,
  rejected: data.data.rejected_appointments,
  rescheduled: data.data.rescheduled_appointments,
  walkins: data.data.walkins,
});


  } catch (error) {
    console.error("Dashboard fetch error:", error);
  } finally {
    setLoading(false);
  }
}, [officer]);




  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleCircleClick = (type) => {
    const filtered = appointments.filter((app) => app.status === type);
    setFilteredAppointments(
      filtered.map((app) => ({
        id: app.appointment_id || app.id,
        name: app.visitor_name || app.name,
        department: app.service_name || app.department,
        date: app.appointment_date
          ? new Date(app.appointment_date).toLocaleDateString()
          : app.date,
        status: app.status,
        reassignedTo: app.reassigned_to,
      }))
    );
    setFilterType(type);
    setShowAppointmentList(true);
  };

  const handleBackToDashboard = () => {
    setShowAppointmentList(false);
    setShowBooking(false);
    setShowAllAppointments(false);
    setFilterType("");
    setActiveMenu("dashboard");
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const handleMenuClick = (menu) => {
  setActiveMenu(menu);

  // Reset all views
  setShowAppointmentList(false);
  setShowBooking(false);
  setShowAllAppointments(false);
  setShowSearchUser(false);

  if (menu === "booking") {
    setShowBooking(true);
  } 
  else if (menu === "all-appointments") {
    setShowAllAppointments(true);
  } 
  else if (menu === "user") {
    setShowSearchUser(true);
  }
};

  if (loading) {
    return (
      <div className="helpdesk-loading">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }
console.log("StatsRow props:", stats);

  return (
    <div>
      <Header />
      <div className="helpdesk-layout">
        <SidebarHelpdesk activeMenu={activeMenu} onMenuClick={handleMenuClick} />

        <div className="helpdesk-main">
          <NavbarHelpdesk username={username} onLogout={handleLogout} />
<div className="helpdesk-content">
  {showBooking ? (
    <HelpdeskBooking onBack={handleBackToDashboard} />
  ) : showAllAppointments ? (
    <HelpdeskAllAppointments onBack={handleBackToDashboard} />
  ) : showSearchUser ? (
    <SearchUserByMobile />
  ) : showAppointmentList ? (
    <AppointmentList
      filteredAppointments={filteredAppointments}
      handleBackToDashboard={handleBackToDashboard}
      filterType={filterType}
    />
  ) : (
    <>
      <div className="dashboard-header">
        <h1>Welcome, {username || "Helpdesk"}</h1>
        <p>Here's an overview of today's activities</p>
      </div>

      <div className="quick-actions">
        <button
          className="action-btn primary"
          onClick={() => {
            setShowBooking(true);
            setActiveMenu("booking");
          }}
        >
          📝 Book Walk-in Appointment
        </button>
      </div>
{/* <h2 style={{ color: "red" }}>
  DEBUG STATS: {JSON.stringify(stats)}
</h2> */}

      <StatsRow stats={stats} onCircleClick={handleCircleClick} />
      <div className="recent-section">
        <h2>Recent Appointments</h2>
        <div className="recent-list">
          {appointments.slice(0, 5).map((app, idx) => (
            <div key={idx} className={`recent-item ${app.status}`}>
              <div className="recent-info">
                <span className="recent-name">
                  {app.visitor_name || app.name}
                </span>
                <span className="recent-service">
                  {app.service_name || app.department}
                </span>
              </div>
              <span className={`recent-status ${app.status}`}>
                {app.status}
              </span>
            </div>
          ))}
          {appointments.length === 0 && (
            <p className="no-recent">No recent appointments</p>
          )}
        </div>
      </div>
    </>
  )}
</div>

        </div>
      </div>
      <Footer />
    </div>
  );
};

export default HelpdeskDashboard;

