import React, { useState } from "react";
import { FaUserCheck, FaWalking, FaEdit, FaTrash, FaCalendarAlt } from "react-icons/fa";
import "../css/appointments.css";

const Appointments = () => {
  const [appointments, setAppointments] = useState([
    { id: 1, visitor: "John Doe", date: "2025-09-30", time: "10:00 AM", officer: "Mr. Sharma", status: "Pending" },
    { id: 2, visitor: "Jane Smith", date: "2025-09-29", time: "02:00 PM", officer: "Ms. Rao", status: "Completed" },
  ]);

  const [walkins, setWalkins] = useState([
    { id: 1, visitor: "Arjun Mehta", purpose: "Document Submission", officer: "Mr. Sharma", time: "11:15 AM" },
    { id: 2, visitor: "Priya Patel", purpose: "General Inquiry", officer: "Ms. Rao", time: "03:30 PM" },
  ]);

  const [search, setSearch] = useState("");

  // Filters
  const filteredAppointments = appointments.filter(a =>
    a.visitor.toLowerCase().includes(search.toLowerCase())
  );

  const filteredWalkins = walkins.filter(w =>
    w.visitor.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="appointments-page">
      {/* Header */}
      <div className="header">
        <h1><FaCalendarAlt /> Appointments & Walk-in Logs</h1>
        <div>
          <button className="add-appointment">Add Appointment</button>
          <button className="add-walkin">Add Walk-in</button>
        </div>
      </div>

      {/* Search */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by visitor name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Quick Stats */}
      <div className="stats-cards">
        <div className="stats-card">
          <h2>{appointments.length}</h2>
          <p>Total Appointments</p>
        </div>
        <div className="stats-card">
          <h2>{appointments.filter(a => a.status === "Completed").length}</h2>
          <p>Completed</p>
        </div>
        <div className="stats-card">
          <h2>{appointments.filter(a => a.status === "Pending").length}</h2>
          <p>Pending</p>
        </div>
        <div className="stats-card">
          <h2>{walkins.length}</h2>
          <p>Walk-ins</p>
        </div>
      </div>

      {/* Appointments Table */}
      <div className="table-container">
        <h2>Appointments</h2>
        <table>
          <thead>
            <tr>
              <th>Visitor</th>
              <th>Date</th>
              <th>Time</th>
              <th>Officer</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAppointments.map(app => (
              <tr key={app.id}>
                <td><FaUserCheck className="icon" /> {app.visitor}</td>
                <td>{app.date}</td>
                <td>{app.time}</td>
                <td>{app.officer}</td>
                <td>{app.status}</td>
                <td className="actions">
                  <button className="edit"><FaEdit /></button>
                  <button className="delete"><FaTrash /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Walk-in Logs Table */}
      <div className="table-container">
        <h2>Walk-in Logs</h2>
        <table>
          <thead>
            <tr>
              <th>Visitor</th>
              <th>Purpose</th>
              <th>Officer</th>
              <th>Time</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredWalkins.map(walkin => (
              <tr key={walkin.id}>
                <td><FaWalking className="icon" /> {walkin.visitor}</td>
                <td>{walkin.purpose}</td>
                <td>{walkin.officer}</td>
                <td>{walkin.time}</td>
                <td className="actions">
                  <button className="edit"><FaEdit /></button>
                  <button className="delete"><FaTrash /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Appointments;
