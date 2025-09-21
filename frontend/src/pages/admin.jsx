import React from "react";
import "./admin.css";
import Cards from "../pages/Cards";

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
import { FaBuilding, FaCalendarAlt, FaUsers, FaChartBar, FaUserCog } from "react-icons/fa";

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
  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2 className="logo">ADMINISTRATIVE</h2>
        <ul>
          <li><FaBuilding /> Departments & Officers</li>
          <li><FaCalendarAlt /> Slot & Holiday Config</li>
          <li><FaUsers /> Appointments & Walk-in Logs</li>
          <li><FaChartBar /> Analytics & Reports</li>
          <li><FaUserCog /> User Roles & Access</li>
        </ul>
      </aside>

      {/* Main Content */}
      <div className="main">
        {/* Top Header */}
        <header className="topbar">
          <div></div>
          <div className="top-actions">
            <span>👤 Admin Profile</span>
            <button className="logout-btn">Logout</button>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="dashboard">
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
                    <Pie data={pieData} dataKey="value" outerRadius={100} label>
                      {pieData.map((entry, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Admin;
