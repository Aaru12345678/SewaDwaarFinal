import React, { useEffect, useState } from "react";
import { FaUserCheck, FaCalendarAlt } from "react-icons/fa";
import { toast } from "react-toastify";
import "../css/appointments.css";
import { useNavigate } from "react-router-dom";
import { deleteAppointment, getAppointmentsSummary } from "../services/api";

/* ===============================
   FORMAT HELPERS (ADDED ONLY)
=============================== */

// yyyy-mm-dd → dd-mm-yyyy
const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-");
  return `${day}-${month}-${year}`;
};

// HH:mm:ss → hh:mm AM/PM
const formatTime = (timeStr) => {
  if (!timeStr) return "";
  let [hours, minutes] = timeStr.split(":");
  hours = parseInt(hours, 10);

  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;

  return `${hours.toString().padStart(2, "0")}:${minutes} ${ampm}`;
};

const Appointments = () => {
  const navigate = useNavigate();

  // ===============================
  // STATE
  // ===============================
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    completed: 0,
    rejected: 0
  });

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [search, setSearch] = useState("");

  // pagination
  const [page, setPage] = useState(1);
  const limit = 10;
  const [totalPages, setTotalPages] = useState(1);

  // ===============================
  // FETCH APPOINTMENTS
  // ===============================
  const fetchAppointments = async () => {
    try {
      const params = {};

      if (fromDate) params.from_date = fromDate;
      if (toDate) params.to_date = toDate;

      const res = await getAppointmentsSummary(params);

      if (res.data.success) {
        const summary = res.data.data || {};

        setStats({
          total: summary.total || 0,
          pending: summary.pending || 0,
          completed: summary.completed || 0,
          rejected: summary.rejected || 0
        });

        setAppointments(summary.appointments || []);

        const total = summary.total || 0;
        setTotalPages(Math.max(1, Math.ceil(total / limit)));
      } else {
        setAppointments([]);
      }
    } catch (err) {
      console.error("Error loading appointments", err);
      setAppointments([]);
    }
  };

  // ===============================
  // LOAD DATA
  // ===============================
  useEffect(() => {
    fetchAppointments();
  }, [page]);

  // ===============================
  // ACTION HANDLERS
  // ===============================
  const handleView = (appointment) => {
    navigate("/admin/appointments/view", {
      state: { appointment }
    });
  };

  const handleDelete = async (appointmentId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this appointment?"
    );
    if (!confirmDelete) return;

    try {
      const res = await deleteAppointment(appointmentId);

      if (res.data.success) {
        setAppointments(prev =>
          prev.filter(app => app.appointment_id !== appointmentId)
        );
        toast.success("Appointment deleted successfully");
      } else {
        toast.error(res.data.message || "Delete failed");
      }
    } catch (error) {
      toast.error("Error deleting appointment");
    }
  };

  // ===============================
  // SEARCH FILTER
  // ===============================
  const filteredAppointments = appointments.filter(a =>
    a.visitor_name?.toLowerCase().includes(search.toLowerCase())
  );

  // ===============================
  // UI
  // ===============================
  return (
    <div className="appointments-page">
      <div className="header">
        <h1><FaCalendarAlt /> Appointments & Walk-In Summary</h1>
      </div>

      {/* Date Filter */}
      <div className="date-row">
        <div className="date-field">
          <label>From Date</label>
          <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
        </div>

        <div className="date-field">
          <label>To Date</label>
          <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
        </div>

        <div className="date-action">
          <label className="ghost-label"></label>
          <button onClick={() => { setPage(1); fetchAppointments(); }}>
            Search
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-cards">
        <div className="stats-card"><h2>{stats.total}</h2><p>Total Appointments</p></div>
        <div className="stats-card"><h2>{stats.completed}</h2><p>Completed</p></div>
        <div className="stats-card"><h2>{stats.pending}</h2><p>Pending</p></div>
        <div className="stats-card"><h2>{stats.rejected}</h2><p>Rejected</p></div>
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
                  <td>{formatDate(app.appointment_date)}</td>
                  <td>{formatTime(app.slot_time)}</td>
                  <td>{app.officer_name || "Helpdesk"}</td>
                  <td><span className={`status ${app.status}`}>{app.status}</span></td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-view" onClick={() => handleView(app)}>View</button>
                      <button className="btn-delete" onClick={() => handleDelete(app.appointment_id)}>Delete</button>
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
        <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</button>
        <span>Page {page} of {totalPages}</span>
        <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
      </div>
    </div>
  );
};

export default Appointments;
