import React, { useEffect, useState } from "react";
import {
  FaUserCheck,
  FaCalendarAlt
} from "react-icons/fa";
import "../css/appointments.css";
import { getAppointmentsSummary } from "../services/api";

const Appointments = () => {
  const today = new Date().toISOString().split("T")[0];

  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    completed: 0,
    rejected: 0
  });

  // 🔹 filters
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  const [search, setSearch] = useState("");

  // 🔹 pagination
  const [page, setPage] = useState(1);
  const limit = 10;
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchAppointments();
  }, [fromDate, toDate, page]);

  const fetchAppointments = async () => {
    try {
      const res = await getAppointmentsSummary({
        from_date: fromDate,
        to_date: toDate,
        page,
        limit
      });

      if (res.data.success) {
        setStats(res.data.stats);
        setAppointments(res.data.appointments);
        setTotalPages(res.data.total_pages);
      }
    } catch (err) {
      console.error("Error loading appointments", err);
    }
  };

  const filteredAppointments = appointments.filter(a =>
    a.visitor_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="appointments-page">
      {/* Header */}
      <div className="header">
        <h1><FaCalendarAlt /> Appointments & Walk-In Summary</h1>
      </div>

     {/* Date Filter (Side by Side) */}
<div className="date-row">
  <div className="date-field">
    <label>From Date</label>
    <input
      type="date"
      value={fromDate}
      onChange={e => setFromDate(e.target.value)}
    />
  </div>

  <div className="date-field">
    <label>To Date</label>
    <input
      type="date"
      value={toDate}
      onChange={e => setToDate(e.target.value)}
    />
  </div>
</div>


      {/* Cards */}
      <div className="stats-cards">
        <div className="stats-card">
          <h2>{stats.total}</h2>
          <p>Total Appointments</p>
        </div>
        <div className="stats-card">
          <h2>{stats.completed}</h2>
          <p>Completed</p>
        </div>
        <div className="stats-card">
          <h2>{stats.pending}</h2>
          <p>Pending</p>
        </div>
        <div className="stats-card">
          <h2>{stats.rejected}</h2>
          <p>Rejected</p>
        </div>
      </div>

      {/* Search */}
      <div className="search-section">
  <label className="search-label">Search</label>

  <div className="search-input-wrapper">
    <span className="search-icon">🔎</span>
    <input
      type="text"
      placeholder="Search visitor"
      value={search}
      onChange={(e) => setSearch(e.target.value)}
    />
  </div>
</div>

      {/* Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Visitor</th>
              <th>Date</th>
              <th>Time</th>
              <th>Officer</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
  {filteredAppointments.length === 0 ? (
    <tr>
      <td colSpan="6" style={{ textAlign: "center", padding: "16px" }}>
        No appointments found
      </td>
    </tr>
  ) : (
    filteredAppointments.map(app => (
      <tr key={app.appointment_id}>
        <td><FaUserCheck /> {app.visitor_name}</td>
        <td>{app.appointment_date}</td>
        <td>{app.slot_time}</td>
        <td>{app.officer_name || "Helpdesk"}</td>

        <td className={`status ${app.status}`}>
          {app.status}
        </td>

        {/* ACTIONS */}
        <td>
          <div className="action-buttons">
            <button className="btn-view">View</button>

            {app.status === "pending" && (
              <>
                <button className="btn-approve">Approve</button>
                <button className="btn-reject">Reject</button>
              </>
            )}
          </div>
        </td>
      </tr>
    ))
  )}
</tbody>

        </table>
      </div>

      {/* Pagination */}
      <div className="pagination">
        <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>
          Prev
        </button>
        <span>Page {page} of {totalPages}</span>
        <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
          Next
        </button>
      </div>
    </div>
  );
};

export default Appointments;
