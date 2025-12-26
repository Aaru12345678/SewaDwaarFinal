import React, { useEffect, useState } from "react";
import { FaUserCheck, FaWalking, FaEdit, FaTrash, FaCalendarAlt, FaPlus } from "react-icons/fa";
import "../css/appointments.css";
import {getAppointmentsSummary} from '../services/api'
import { useNavigate } from "react-router-dom";

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
const [stats, setStats] = useState({
  total: 0,
  pending: 0,
  approved: 0,
  rejected: 0,
  rescheduled: 0,
  completed: 0
});

  const [walkins, setWalkins] = useState([
    { id: 1, visitor: "Arjun Mehta", purpose: "Document Submission", officer: "Mr. Sharma", time: "11:15 AM" },
    { id: 2, visitor: "Priya Patel", purpose: "General Inquiry", officer: "Ms. Rao", time: "03:30 PM" },
  ]);

  const [search, setSearch] = useState("");
  const [showWalkinForm, setShowWalkinForm] = useState(false);
  const [newWalkin, setNewWalkin] = useState({
    visitor: "",
    purpose: "",
    officer: "",
    time: "",
  });

  const filteredAppointments = appointments.filter((a) =>
  a.visitor_name?.toLowerCase().includes(search.toLowerCase())
);


  useEffect(() => {
  fetchAppointments();
}, []);

const fetchAppointments = async () => {
  try {
    const res = await getAppointmentsSummary();
    console.log(res,"ress")
    if (res.data.success) {
      const data = res.data.data;

      // Stats
      setStats({
        total: data.total,
        pending: data.pending,
        approved: data.approved,
        rejected: data.rejected,
        rescheduled: data.rescheduled,
        completed: data.completed
      });

      // Appointment list
      setAppointments(data.appointments || []);
    }
  } catch (error) {
    console.error("Error fetching appointments", error);
  }
};
const filteredWalkins = walkins.filter((w) =>
    w.visitor.toLowerCase().includes(search.toLowerCase())
  );

  // Add walk-in
  const handleAddWalkin = () => {
    if (!newWalkin.visitor || !newWalkin.purpose || !newWalkin.officer || !newWalkin.time) {
      alert("Please fill all fields!");
      return;
    }
    const newEntry = { id: walkins.length + 1, ...newWalkin };
    setWalkins([...walkins, newEntry]);
    setNewWalkin({ visitor: "", purpose: "", officer: "", time: "" });
    setShowWalkinForm(false);
  };
  const navigate = useNavigate();


  return (
    <div className="appointments-page">
      {/* Header */}
      <div className="header">
        <h1><FaCalendarAlt /> Appointments & Walk In Summary</h1>
        <div>
          {/* <button className="add-appointment" onClick={() => navigate("/appointment-wizard2")}>Add Appointment</button> */}
          {/* <button className="add-walkin" onClick={() => setShowWalkinForm(true)}>
            <FaPlus /> Add Walk-in
          </button> */}
        </div>
      </div>

      {/* Search */}
      {/* <div className="search-bar">
        <input
          type="text"
          placeholder="Search by visitor name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div> */}

      {/* Quick Stats */}
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
<div className="table-filter">
    <input
      type="text"
      placeholder="Filter by visitor name"
      value={search}
      onChange={(e) => setSearch(e.target.value)}
    />
  </div>

      {/* Appointments Table */}
      <div className="table-container">
        <h2>Appointments</h2>
        <table>
          <thead>
            <tr>
              <th>Visitor</th><th>Date</th><th>Time</th><th>Officer</th><th>Status</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAppointments.map((app) => (
  <tr key={app.appointment_id}>
    <td>
      <FaUserCheck className="icon" />
      {app.visitor_name}
    </td>
    <td>{app.appointment_date}</td>
    <td>{app.slot_time}</td>
    <td>{app.officer_name || "Helpdesk"}</td>
    <td className={`status ${app.status}`}>
      {app.status}
    </td>
    <td className="actions">
      <button className="edit"><FaEdit /></button>
      <button className="delete"><FaTrash /></button>
    </td>
  </tr>
))}

          </tbody>
        </table>
      </div>

      {/* Walk-in Table */}
      <div className="table-container">
        <h2>Walk-in Logs</h2>
        <table>
          <thead>
            <tr><th>Visitor</th><th>Purpose</th><th>Officer</th><th>Time</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {filteredWalkins.map((w) => (
              <tr key={w.id}>
                <td><FaWalking className="icon" /> {w.visitor}</td>
                <td>{w.purpose}</td>
                <td>{w.officer}</td>
                <td>{w.time}</td>
                <td className="actions">
                  <button className="edit"><FaEdit /></button>
                  <button className="delete"><FaTrash /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Walk-in Modal */}
      {showWalkinForm && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h2>Add New Walk-in</h2>
            <input
              type="text"
              placeholder="Visitor Name"
              value={newWalkin.visitor}
              onChange={(e) => setNewWalkin({ ...newWalkin, visitor: e.target.value })}
            />
            <input
              type="text"
              placeholder="Purpose"
              value={newWalkin.purpose}
              onChange={(e) => setNewWalkin({ ...newWalkin, purpose: e.target.value })}
            />
            <input
              type="text"
              placeholder="Officer Name"
              value={newWalkin.officer}
              onChange={(e) => setNewWalkin({ ...newWalkin, officer: e.target.value })}
            />
            <input
              type="time"
              value={newWalkin.time}
              onChange={(e) => setNewWalkin({ ...newWalkin, time: e.target.value })}
            />
            <div className="modal-buttons">
              <button className="save-btn" onClick={handleAddWalkin}>Save</button>
              <button className="cancel-btn" onClick={() => setShowWalkinForm(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointments;
