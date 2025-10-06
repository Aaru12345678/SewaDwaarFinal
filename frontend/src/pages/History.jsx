import React, { useState, useEffect } from "react";
import "../css/Dashboard.css";

function History() {
  const [history, setHistory] = useState([
    { id: 101, visitor: "Ravi Kumar", department: "Health", date: "28 Sep 2025", remarks: "Follow-up required", status: "completed" },
    { id: 102, visitor: "Anita Sharma", department: "Transport", date: "29 Sep 2025", remarks: "Submitted documents", status: "completed" },
  ]);

  return (
    <div className="dashboard-container">
      <div className="dashboard-inner">
        <h2>Appointment History</h2>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Visitor</th>
                <th>Department</th>
                <th>Date</th>
                <th>Status</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {history.map(appt => (
                <tr key={appt.id}>
                  <td>{appt.visitor}</td>
                  <td>{appt.department}</td>
                  <td>{appt.date}</td>
                  <td><span className={`status ${appt.status}`}>{appt.status}</span></td>
                  <td>{appt.remarks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default History;
