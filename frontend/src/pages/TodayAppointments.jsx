import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../css/Dashboard.css";

function TodayAppointments() {
  const [appointments, setAppointments] = useState([
    { id: 1, visitor: "John Doe", department: "Revenue", time: "10:00 AM", status: "pending" },
    { id: 2, visitor: "Priya Sharma", department: "Education", time: "11:30 AM", status: "approved" },
  ]);

  return (
    <div className="dashboard-container">
      <div className="dashboard-inner">
        <h2>Today’s Appointments</h2>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Visitor</th>
                <th>Department</th>
                <th>Time</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map(appt => (
                <tr key={appt.id}>
                  <td>{appt.visitor}</td>
                  <td>{appt.department}</td>
                  <td>{appt.time}</td>
                  <td><span className={`status ${appt.status}`}>{appt.status}</span></td>
                  <td>
                    <Link to={`/officer/action/${appt.id}`} className="view-btn">View</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default TodayAppointments;
