// src/pages/AppointmentList.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./css/AppointmentList.css";

const AppointmentList = () => {
  // Dummy data (replace with API data later)
  const [appointments, setAppointments] = useState([
    {
      id: 101,
      officer: "Mr. Sharma",
      department: "Revenue",
      dateTime: "18-Sep-25",
      status: "Pending",
    },
    {
      id: 102,
      officer: "Ms. Patel",
      department: "Health",
      dateTime: "19-Sep-25",
      status: "Accepted",
    },
    {
      id: 103,
      officer: "Mr. Singh",
      department: "Education",
      dateTime: "15-Sep-25",
      status: "Completed",
    },
    {
    id: 104,
    officer: "Ms. Mehta",
    department: "IT",
    dateTime: "14-Sep-25",
    status: "Cancelled",
  },
  ]);
  const navigate = useNavigate();
  // Example actions
  const handleCancel = (id) => {
    alert(`Appointment ${id} cancelled`);
    setAppointments((prev) =>
      prev.map((appt) =>
        appt.id === id ? { ...appt, status: "Cancelled" } : appt
      )
    );
  };

   const handleViewPass = (id) => {
    navigate(`/appointment-pass/${id}`); // ✅ include appointment ID
  };

  const handleView = (id) => {
    navigate(`/appointment/${id}`); // ✅ go to details page
  };

  return (
    <div className="appointment-list-container">
      <h2>📅 My Appointments</h2>
      <table className="appointment-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Officer</th>
            <th>Department</th>
            <th>Date & Time</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {appointments.map((appt) => (
            <tr key={appt.id}>
              <td>{appt.id}</td>
              <td>{appt.officer}</td>
              <td>{appt.department}</td>
              <td>{appt.dateTime}</td>
              <td className={`status ${appt.status.toLowerCase()}`}>
                {appt.status}
              </td>
              <td>
                {appt.status === "Pending" && (
                  <>
                    <button onClick={() => handleView(appt.id)}>View</button>
                    <button onClick={() => handleCancel(appt.id)}>Cancel</button>
                  </>
                )}
                {appt.status === "Accepted" && (
                  <button onClick={() => handleViewPass(appt.id)}>
                    View Pass
                  </button>
                )}
                {appt.status === "Completed" && (
                  <button onClick={() => handleView(appt.id)}>View Details</button>
                )}
                {appt.status === "Cancelled" && <span>❌ Cancelled</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AppointmentList;
