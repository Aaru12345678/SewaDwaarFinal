import React, { useEffect, useState } from "react";
import { FaUserCheck, FaCalendarAlt } from "react-icons/fa";
import { toast } from "react-toastify";
import "../css/appointments.css";
import { useNavigate } from "react-router-dom";
import { deleteAppointment, getAppointmentsSummary } from "../services/api";

/* ===============================
   FORMAT HELPERS
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

  /* ===============================
     STATE
  =============================== */
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    completed: 0,
    rejected: 0,
  });

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // pagination
  const [page, setPage] = useState(1);
  const limit = 10;
  const [totalPages, setTotalPages] = useState(1);

  /* ===============================
     FETCH APPOINTMENTS
  =============================== */
  const fetchAppointments = async () => {
    try {
      const params = {};
      if (fromDate) params.from_date = fromDate;
      if (toDate) params.to_date = toDate;

      const res = await getAppointmentsSummary(params);

     if (res.data.success) {
  const summary = res.data.data || {};

  const sortedAppointments = (summary.appointments || []).sort(
    (a, b) => {
      const dateTimeA = new Date(
        `${a.appointment_date}T${a.slot_time}`
      );
      const dateTimeB = new Date(
        `${b.appointment_date}T${b.slot_time}`
      );
      return dateTimeB - dateTimeA; // DESC
    }
  );

  setStats({
    total: summary.total || 0,
    pending: summary.pending || 0,
    completed: summary.completed || 0,
    rejected: summary.rejected || 0
  });

  setAppointments(sortedAppointments);
}

}catch{

}
  }
  /* ===============================
     INITIAL LOAD
  =============================== */
  useEffect(() => {
    fetchAppointments();
  }, []);

  /* ===============================
     AUTO FETCH ON DATE CHANGE
  =============================== */
  useEffect(() => {
    setPage(1);
    fetchAppointments();
  }, [fromDate, toDate]);

  /* ===============================
     FILTERING (CLIENT SIDE)
  =============================== */
  const filteredAppointments = appointments.filter((a) => {
    const matchSearch = a.visitor_name
      ?.toLowerCase()
      .includes(search.toLowerCase());

    const matchStatus = statusFilter ? a.status === statusFilter : true;

    return matchSearch && matchStatus;
  });

  /* ===============================
     RESET PAGE ON FILTER CHANGE
  =============================== */
  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  /* ===============================
     PAGINATION LOGIC
  =============================== */
  useEffect(() => {
    const pages = Math.max(
      1,
      Math.ceil(filteredAppointments.length / limit)
    );
    setTotalPages(pages);

    if (page > pages) {
      setPage(1);
    }
  }, [filteredAppointments, limit, page]);

  const startIndex = (page - 1) * limit;
  const paginatedAppointments = filteredAppointments.slice(
    startIndex,
    startIndex + limit
  );

  /* ===============================
     ACTION HANDLERS
  =============================== */
  const handleView = (appointment) => {
    navigate("/admin/appointments/view", {
      state: { appointment },
    });
  };

  const handleDelete = async (appointmentId) => {
    if (!window.confirm("Are you sure you want to delete this appointment?"))
      return;

    try {
      const res = await deleteAppointment(appointmentId);

      if (res.data.success) {
        setAppointments((prev) =>
          prev.filter((a) => a.appointment_id !== appointmentId)
        );
        toast.success("Appointment deleted successfully");
      } else {
        toast.error(res.data.message || "Delete failed");
      }
    } catch {
      toast.error("Error deleting appointment");
    }
  };

  /* ===============================
     UI
  =============================== */
  return (
    <div className="appointments-page">
      <div className="header">
        <h1>
          <FaCalendarAlt /> Appointments & Walk-In Summary
        </h1>
      </div>

      {/* Date Filter */}
      <div className="date-row">
        <div className="date-field">
          <label>From Date</label>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </div>

        <div className="date-field">
          <label>To Date</label>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>
      </div>

      {/* Stats */}
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

      {/* Search + Status */}
      <div className="search-filter-row">
        <div className="search-box">
          <span className="search-icon">🔎</span>
          <input
            type="text"
            placeholder="Search visitor"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="status-filter">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="completed">Completed</option>
            <option value="rejected">Rejected</option>
          </select>
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
            {paginatedAppointments.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: "center" }}>
                  No appointments found
                </td>
              </tr>
            ) : (
              paginatedAppointments.map((app) => (
                <tr key={app.appointment_id}>
                  <td>
                    <FaUserCheck /> {app.visitor_name}
                  </td>
                  <td>{formatDate(app.appointment_date)}</td>
                  <td>{formatTime(app.slot_time)}</td>
                  <td>{app.officer_name || "Helpdesk"}</td>
                  <td>
                    <span className={`status ${app.status}`}>
                      {app.status}
                    </span>
                  </td>
                  <td>
                    <button onClick={() => handleView(app)}>View</button>
                    <button onClick={() => handleDelete(app.appointment_id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="pagination">
        <button disabled={page === 1} onClick={() => setPage(page - 1)}>
          Prev
        </button>
        <span>
          Page {page} of {totalPages}
        </span>
        <button
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Appointments;
