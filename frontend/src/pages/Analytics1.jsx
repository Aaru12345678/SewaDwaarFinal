import React, { useEffect, useState } from "react";
import "../css/Analytics1.css";

import {
  fetchApplicationAppointmentKpis,
  fetchApplicationAppointmentsTrend,
  fetchAppointmentsByDepartment,
  fetchAppointmentsByService,
} from "../services/api";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Legend,
} from "recharts";

const Analytics1 = ({ filters }) => {
  /* ================= KPI STATE ================= */
  const [kpis, setKpis] = useState({
    total_appointments: 0,
    upcoming_appointments: 0,
    completed_appointments: 0,
    rejected_appointments: 0,
    pending_appointments: 0,
  });

  /* ================= TREND ================= */
  const [trendType, setTrendType] = useState("month");
  const [trendData, setTrendData] = useState([]);
  const [loadingTrend, setLoadingTrend] = useState(false);

  /* ================= DEPARTMENT ================= */
  const [deptData, setDeptData] = useState([]);
  const [loadingDept, setLoadingDept] = useState(false);

  /* ================= SERVICE ================= */
  const [serviceData, setServiceData] = useState([]);
  const [loadingService, setLoadingService] = useState(false);

  const [loadingKpis, setLoadingKpis] = useState(false);

  /* ================= FETCH KPIs ================= */
  useEffect(() => {
  const loadKpis = async () => {
    setLoadingKpis(true);
    try {
      const res = await fetchApplicationAppointmentKpis(filters || {});
      setKpis(res || {});
    } catch (err) {
      console.error("Failed to load KPIs", err);
    } finally {
      setLoadingKpis(false);
    }
  };

  loadKpis();
}, [filters]);


  /* ================= FETCH TREND ================= */
  useEffect(() => {
  const loadTrend = async () => {
    setLoadingTrend(true);
    try {
      const res = await fetchApplicationAppointmentsTrend({
        ...(filters || {}),
        dateType: trendType,
      });
      setTrendData(res || []);
    } catch (err) {
      console.error("Failed to load trend", err);
    } finally {
      setLoadingTrend(false);
    }
  };

  loadTrend();
}, [filters, trendType]);

  /* ================= FETCH DEPARTMENT ================= */
  useEffect(() => {
  const loadDept = async () => {
    setLoadingDept(true);
    try {
      const deptFilters = { ...(filters || {}) };
      delete deptFilters.service_id; // correct logic

      const res = await fetchAppointmentsByDepartment(deptFilters);
      setDeptData(res || []);
    } catch (err) {
      console.error("Failed to load department data", err);
    } finally {
      setLoadingDept(false);
    }
  };

  loadDept();
}, [filters]);


  /* ================= FETCH SERVICE ================= */
  useEffect(() => {
  const loadService = async () => {
    setLoadingService(true);
    try {
      const res = await fetchAppointmentsByService(filters || {});
      setServiceData(res || []);
    } catch (err) {
      console.error("Failed to load service data", err);
    } finally {
      setLoadingService(false);
    }
  };

  loadService();
}, [filters]);


  /* ================= KPI CARDS ================= */
  const cards = [
    { label: "Total Appointments", value: kpis.total_appointments, className: "kpi-blue" },
    { label: "Upcoming (Approved)", value: kpis.upcoming_appointments, className: "kpi-indigo" },
    { label: "Completed", value: kpis.completed_appointments, className: "kpi-green" },
    { label: "Pending Approval", value: kpis.pending_appointments, className: "kpi-orange" },
    { label: "Rejected / Cancelled / No-Show", value: kpis.rejected_appointments, className: "kpi-red" },
  ];

  return (
    <>

    <div className="analytics-header">
  <h2>Appointment Analytics</h2>

  <button
    className="print-btn"
    onClick={() => window.print()}
  >
    🖨 Print
  </button>
</div>
<div className="print-area">
      {/* ================= KPI CARDS ================= */}
      <div className="kpi-container">
        {cards.map((card, idx) => (
          <div key={idx} className={`kpi-card ${card.className}`}>
            <div className="kpi-value">
              {loadingKpis ? "--" : card.value}
            </div>
            <div className="kpi-label">{card.label}</div>
          </div>
        ))}
      </div>

      {/* ================= TREND CHART ================= */}
      <div className="chart-card">
        <div className="chart-header">
          <h3 className="chart-title">Appointments Over Time</h3>
          <select value={trendType} onChange={(e) => setTrendType(e.target.value)}>
            <option value="day">Day</option>
            <option value="month">Month</option>
            <option value="year">Year</option>
          </select>
        </div>

        {loadingTrend ? (
          <div className="chart-loading">Loading trend data...</div>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#1f4ed8"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* ================= BAR CHARTS ================= */}
      <div className="charts-grid">
        {/* Department */}
        <div className="chart-card">
          <h3 className="chart-title">Appointments by Department</h3>
          {loadingDept ? (
            <div className="chart-loading">Loading...</div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={deptData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="department_name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#16a34a" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Service */}
        <div className="chart-card">
          <h3 className="chart-title">Appointments by Service</h3>
          {loadingService ? (
            <div className="chart-loading">Loading...</div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={serviceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="service_name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#dc2626" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
      </div>
    </>
  );
};

export default Analytics1;
