import React, { useEffect, useState } from "react";
import "../css/Analytics1.css";
import {
  fetchWalkinKpis,
  fetchWalkinsTrend,
  fetchWalkinsByDepartment,
  fetchWalkinsByService,
} from "../services/api";

import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, CartesianGrid
} from "recharts";

const WalkInAppointments = ({ filters }) => {
  const [loading, setLoading] = useState(false);
  const [trendType, setTrendType] = useState("day");
  const [kpis, setKpis] = useState({});
  const [trend, setTrend] = useState([]);
  const [byDept, setByDept] = useState([]);
  const [byService, setByService] = useState([]);

  // ---------------- Helpers ----------------
  const isEmptyFilter = !filters || Object.keys(filters).length === 0;
  const getTodayPayload = () => {
    const today = new Date().toISOString().split("T")[0];
    return { from_date: today, to_date: today };
  };

  // ---------------- Load all data ----------------
  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      try {
        const basePayload = isEmptyFilter ? getTodayPayload() : { ...filters };

        const [kpiRes, trendRes, deptRes, serviceRes] = await Promise.all([
          fetchWalkinKpis(basePayload),
          fetchWalkinsTrend({ ...basePayload, dateType: trendType }),
          fetchWalkinsByDepartment(basePayload),
          fetchWalkinsByService(basePayload),
        ]);

        setKpis(kpiRes || {});
        setTrend(trendRes || []);
        setByDept(deptRes || []);
        setByService(serviceRes || []);
      } catch (err) {
        console.error("Walk-in analytics error", err);
      } finally {
        setLoading(false);
      }
    };

    loadAll();
  }, [filters, trendType]);

  // ---------------- KPI CARDS ----------------
  const cards = [
    { label: "Total Walk-ins", value: kpis.total_walkins, cls: "blue" },
    //{ label: "Today’s Walk-ins", value: kpis.today_walkins, cls: "indigo" },
    { label: "Approved", value: kpis.approved_walkins, cls: "green" },
    { label: "Pending", value: kpis.pending_walkins, cls: "orange" },
    { label: "Completed", value: kpis.completed_walkins, cls: "green" },
    { label: "Rescheduled", value: kpis.rescheduled_walkins, cls: "purple" }, // ✅ Added
    { label: "Rejected / Cancelled", value: kpis.rejected_walkins, cls: "red" },
  ];

  return (
    <div className="walkin-analytics">

      {/* ================= KPIs ================= */}
      <div className="wa-section">
        <h2 className="wa-title">Walk-in KPIs</h2>
        <div className="wa-kpis">
          {cards.map((c, i) => (
            <div key={i} className={`wa-kpi wa-${c.cls}`}>
              <div className="wa-kpi-value">{loading ? "--" : c.value || 0}</div>
              <div className="wa-kpi-label">{c.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ================= TREND ================= */}
      <div className="wa-section">
        <div className="wa-card full">
          <div className="wa-card-header">
            <h3>Walk-Ins Over Time</h3>
            <select
              className="wa-select"
              value={trendType}
              onChange={(e) => setTrendType(e.target.value)}
            >
              <option value="day">Day</option>
              <option value="month">Month</option>
              <option value="year">Year</option>
            </select>
          </div>
          <div className="wa-chart">
            {trend.length === 0 ? (
              "No data"
            ) : (
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={trend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
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
        </div>
      </div>

      {/* ================= DEPT + SERVICE ================= */}
      <div className="wa-section wa-grid-2">
        <div className="wa-card">
          <h3>Walk-Ins by Department</h3>
          <div className="wa-chart">
            {byDept.length === 0 ? "No data" : (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={byDept}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="department_name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#16a34a" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="wa-card">
          <h3>Walk-Ins by Service</h3>
          <div className="wa-chart">
            {byService.length === 0 ? "No data" : (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={byService}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="service_name" angle={-10} textAnchor="end" interval={0} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#dc2626" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalkInAppointments;
