import React, { useState } from "react";
import "../css/analytics.css";
import { FaChartLine } from "react-icons/fa";
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
  BarChart,
  Bar,
} from "recharts";

// Sample Data
const fullTrendData = [
  { name: "Mon", value: 10 },
  { name: "Tue", value: 12 },
  { name: "Wed", value: 18 },
  { name: "Thu", value: 15 },
  { name: "Fri", value: 17 },
  { name: "Sat", value: 14 },
  { name: "Sun", value: 20 },
];

const fullDeptData = [
  { name: "Dept A", value: 40 },
  { name: "Dept B", value: 30 },
  { name: "Dept C", value: 30 },
];

const fullWalkinData = [
  { name: "Scheduled", value: 80 },
  { name: "Walk-in", value: 20 },
];

const fullOfficerData = [
  { name: "Officer A", value: 30 },
  { name: "Officer B", value: 50 },
  { name: "Officer C", value: 20 },
];

const COLORS = ["#4e73df", "#1cc88a", "#36b9cc", "#f6c23e", "#e74a3b"];

const Analytics = () => {
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [officerFilter, setOfficerFilter] = useState("All");

  const trendData = fullTrendData;
  const deptData =
    departmentFilter === "All"
      ? fullDeptData
      : fullDeptData.filter((d) => d.name === departmentFilter);

  const walkinData = fullWalkinData;
  const officerData =
    officerFilter === "All"
      ? fullOfficerData
      : fullOfficerData.filter((d) => d.name === officerFilter);

  return (
    <div className="analytics-roles-page">
      {/* Header */}
      <div className="header">
        <h1><FaChartLine /> Analytics Dashboard</h1>
      </div>

      <div className="dashboard">
        {/* Filters */}
        <div className="filters">
          <label>
            Department:
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
            >
              <option value="All">All</option>
              <option value="Dept A">Dept A</option>
              <option value="Dept B">Dept B</option>
              <option value="Dept C">Dept C</option>
            </select>
          </label>

          <label>
            Officer:
            <select
              value={officerFilter}
              onChange={(e) => setOfficerFilter(e.target.value)}
            >
              <option value="All">All</option>
              <option value="Officer A">Officer A</option>
              <option value="Officer B">Officer B</option>
              <option value="Officer C">Officer C</option>
            </select>
          </label>
        </div>

        {/* Cards */}
        <div className="cards">
          <div className="card">
            Total Appointments: {trendData.reduce((acc, cur) => acc + cur.value, 0)}
          </div>
          <div className="card">
            Walk-ins Today: {walkinData.find((d) => d.name === "Walk-in")?.value || 0}
          </div>
          <div className="card">Active Departments: {deptData.length}</div>
          <div className="card">
            Active Officers: {officerData.reduce((acc, cur) => acc + cur.value, 0)}
          </div>
        </div>

        {/* Charts */}
        <div className="analytics-page">
        <div className="charts">
          {/* 1. Appointments Trend */}
          <div className="chart">
            <h3>Appointments Trend</h3>
            <div className="chart-content">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#4e73df" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 2. Department-wise Appointments */}
          <div className="chart">
            <h3>Department-wise Appointments</h3>
            <div className="chart-content">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={deptData} dataKey="value" outerRadius={80} label>
                    {deptData.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 3. Walk-ins vs Scheduled */}
          <div className="chart">
            <h3>Walk-ins vs Scheduled</h3>
            <div className="chart-content">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={walkinData} dataKey="value" outerRadius={80} label>
                    {walkinData.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 4. Officer Workload */}
          <div className="chart">
            <h3>Officer Workload</h3>
            <div className="chart-content">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={officerData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#1cc88a" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 5. Slot Utilization / Peak Hours */}
          <div className="chart">
            <h3>Slot Utilization / Peak Hours</h3>
            <div className="chart-content">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#f6c23e" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default Analytics;
