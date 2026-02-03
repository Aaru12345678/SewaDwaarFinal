import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../css/VisitorDashboard.css";
import { getVisitorDashboard,getVisitorProfile } from "../services/api";
import VisitorNavbar from "./VisitorNavbar";

import Header from "../Components/Header";
import NavbarMain from "../Components/NavbarMain";
import Footer from "../Components/Footer";
import "./MainPage.css";
import NavbarTop from "../Components/NavbarTop";

const VisitorDashboard = () => {
  const navigate = useNavigate();
  const username = localStorage.getItem("username");

  const [fullName, setFullName] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [walkins, setWalkins] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
const [visitor, setVisitor] = useState(null);

  // ✅ Fetch Dashboard Data (ONLY ONE useEffect)

  useEffect(() => {
  const fetchProfile = async () => {
    try {
      const res = await getVisitorProfile(username);
      if (res.data?.success) {
        setVisitor(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  fetchProfile();
}, [username]);

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
        
        setFullName(data?.data?.full_name || username);
        setAppointments(data?.data?.appointments || []);
        setWalkins(data?.data?.walkins || []);

        setNotifications(
          (data?.data?.notifications || []).map((n) => ({
            ...n,
            type: n.type ? n.type.toLowerCase() : "info",
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

  // ✅ Merge appointments + walkins into ONE list
  const combinedAppointments = [
    ...(appointments || []).map((a) => ({
      ...a,
      rowType: "appointment",
      id: a.appointment_id,
      date: a.appointment_date,
    })),
    ...(walkins || []).map((w) => ({
      ...w,
      rowType: "walkin",
      id: w.walkin_id,
      date: w.walkin_date,
    })),
  ];

  // ✅ Sort Latest first (optional)
  combinedAppointments.sort((a, b) => (b.id > a.id ? 1 : -1));

  // ✅ Card counts include BOTH
  const totalCount = combinedAppointments.length;
  const upcomingCount = combinedAppointments.filter(
    (a) => a.status?.toLowerCase() === "approved"
  ).length;
  const pendingCount = combinedAppointments.filter(
    (a) => a.status?.toLowerCase() === "pending"
  ).length;
  const completedCount = combinedAppointments.filter(
    (a) => a.status?.toLowerCase() === "completed"
  ).length;
  const cancelledCount = combinedAppointments.filter((a) =>
    ["rejected", "cancelled"].includes(a.status?.toLowerCase())
  ).length;
  const rescheduledCount = combinedAppointments.filter(
  (a) => a.status?.toLowerCase() === "rescheduled"
).length;

const expiredCount = combinedAppointments.filter(
  (a) => a.status?.toLowerCase() === "expired"
).length;


  // ✅ View Button handler
  const handleView = (type, id) => {
    if (type === "walkin") {
      navigate(`/appointment/${id}`);
    } else {
      navigate(`/appointment/${id}`);
    }
  };

  if (loading) return <p>Loading dashboard...</p>;

  return (
    <>
      <div className="fixed-header">
        <NavbarTop />
        <Header />
       <VisitorNavbar
  fullName={fullName}
  photo={visitor?.photo || visitor?.photo_url}
/>

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

                <div className="card rescheduled">
  <h3>Rescheduled</h3>
  <p className="count">{rescheduledCount}</p>
</div>

<div className="card expired">
  <h3>Expired</h3>
  <p className="count">{expiredCount}</p>
</div>

              </div>

              <Link to="/appointment-wizard">
                <button className="book-btn">📅 Book New Appointment</button>
              </Link>

            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default VisitorDashboard;
