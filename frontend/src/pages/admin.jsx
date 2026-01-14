import React, { useEffect } from "react";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import "../css/admin.css";
import ViewAppointment from "./ViewAppointment";


import Cards from "../pages/Cards";
import Departments from "../pages/Departments";
import SlotConfig from "../pages/SlotConfig";
import Appointments from "../pages/Appointments";
import Analytics1 from "../pages/Analytics1";
import UserRoles from "../pages/UserRoles";
import { toast } from "react-toastify";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  FaBuilding,
  FaCalendarAlt,
  FaUsers,
  FaChartBar,
  FaUserCog,
} from "react-icons/fa";
import AppointmentsTab from "./AppointmentsTab";
import SlotConfiguration from "./SlotConfiguration";

// Chart Data
const data = [
  { name: "Mon", value: 10 },
  { name: "Tue", value: 12 },
  { name: "Wed", value: 18 },
  { name: "Thu", value: 15 },
  { name: "Fri", value: 17 },
  { name: "Sat", value: 14 },
  { name: "Sun", value: 20 },
];

const pieData = [
  { name: "Dept A", value: 40 },
  { name: "Dept B", value: 30 },
  { name: "Dept C", value: 30 },
];

const COLORS = ["#4e73df", "#1cc88a", "#36b9cc"];

const Admin = () => {
  const navigate = useNavigate();
     const username = localStorage.getItem("username"); 

  // ✅ Logout function
  const handleLogout = () => {
    // Clear stored user data (adjust if you store tokens or admin info)
    
    localStorage.removeItem("token");
    localStorage.removeItem("user_id", data.user_id);
      localStorage.removeItem("officer_id", data.officer_id);
      localStorage.removeItem("role_code", data.role || "");
      localStorage.removeItem("username", data.username);
    // Redirect to login page
    navigate("/login");
  };
 
  useEffect(()=>{if (!username) {
      toast.error("Please log in first");
      navigate("/login");
      return;}},[username])
  

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2 className="logo">ADMINISTRATIVE</h2>
        <ul>
          <li>
            <Link to="departments">
              <FaBuilding /> Departments & Officers
            </Link>
          </li>
          <li>
            <Link to="slot-config">
              <FaCalendarAlt /> Slot & Holiday Config
            </Link>
          </li>
          <li>
            <Link to="appointments">
              <FaUsers />  Appointments & Walk In Summary
            </Link>
          </li>
          <li>
            <Link to="analytics">
              <FaChartBar /> Analytics & Reports
            </Link>
          </li>
          <li>
            <Link to="user-roles">
              <FaUserCog /> User Roles & Access
            </Link>
          </li>
        </ul>
      </aside>

      {/* Main Content */}
      <div className="main">
        {/* Top Header */}
        <header className="topbar">
          <div></div>
          <div className="top-actions">
            <span>👤 Admin Profile</span>
            {/* ✅ Clickable Logout Button */}
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="dashboard">
          <Routes>
            {/* Dashboard (default) */}
            <Route
              path="/"
              element={
                <>
                  {/* Cards */}
                  <div className="cards">
                    <Cards number="115" label="Total Appointments" />
                    <Cards number="23" label="Walk-ins Today" />
                    <Cards number="04" label="Active Departments" />
                    <Cards number="08" label="Active Officers" />
                  </div>

                  {/* Charts */}
                  <div className="charts">
                    <div className="chart">
                      <h3>Appointments Trend</h3>
                      <div className="chart-content">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Line
                              type="monotone"
                              dataKey="value"
                              stroke="#4e73df"
                              strokeWidth={2}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="chart">
                      <h3>Department-wise Appointments</h3>
                      <div className="chart-content">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={pieData}
                              dataKey="value"
                              outerRadius={100}
                              label
                            >
                              {pieData.map((entry, index) => (
                                <Cell
                                  key={index}
                                  fill={COLORS[index % COLORS.length]}
                                />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                </>
              }
            />

            {/* Other Pages */}
            <Route path="departments" element={<Departments />} />
            <Route path="slot-config" element={<SlotConfiguration />} />
            <Route path="appointments" element={<Appointments />} />
            <Route path="appointments/view" element={<ViewAppointment />} />
            <Route path="analytics" element={<AppointmentsTab />} />
            <Route path="user-roles" element={<UserRoles />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default Admin;
