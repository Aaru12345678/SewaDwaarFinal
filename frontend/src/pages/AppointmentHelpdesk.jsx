import React from "react";
import "../css/AppointmentList.css";

const AppointmentList = ({ filteredAppointments, handleBackToDashboard, filterType }) => {
  const formatFilterLabel = (f) => {
    if (f === "today") return "Today's";
    return f.charAt(0).toUpperCase() + f.slice(1);
  };

  return (
    <div className="appointment-list-container">
      <div className="list-header">
        <button className="back-btn" onClick={handleBackToDashboard}>← Back</button>
        <h3 className="list-title">{formatFilterLabel(filterType)} Appointments</h3>
      </div>
      <ul className="appointment-list">
        {filteredAppointments.length === 0 && <li className="no-data">No appointments found for this category.</li>}
        {filteredAppointments.map((app) => (
          <li key={app.id} className={`appointment-item ${app.status}`}>
            <div>
              <div className="app-name">{app.name}</div>
              <div className="app-dept">{app.department} Dept. • {app.date}</div>
            </div>
            <div className="app-status">
              {app.status === "reassigned" ? `Reassigned → ${app.reassignedTo || "N/A"}` : app.status.charAt(0).toUpperCase() + app.status.slice(1)}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AppointmentList;
