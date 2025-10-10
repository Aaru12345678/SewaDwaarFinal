import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/AppointmentList.css";
import { getVisitorDashboard } from "../services/api"; // ✅ import api
import VisitorNavbar from "./VisitorNavbar"; // ✅ import navbar

const AppointmentList = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const username = localStorage.getItem("username"); // visitor_id

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!username) return;

    const fetchAppointments = async () => {
      setLoading(true);
      const { data, error } = await getVisitorDashboard(username);

      if (error) {
        alert("Failed to fetch appointments");
      } else if (data && data.success) {
        setFullName(data.data.full_name || username);
        setAppointments(data.data.appointments || []);
      }
      setLoading(false);
    };

    fetchAppointments();
  }, [username]);

  const handleCancel = (id) => {
    alert(`Appointment ${id} cancelled`);
    setAppointments((prev) =>
      prev.map((appt) =>
        appt.appointment_id === id ? { ...appt, status: "Cancelled" } : appt
      )
    );
  };

  const handleViewPass = (id) => navigate(`/appointment-pass/${id}`);
  const handleView = (id) => navigate(`/appointment/${id}`);

  if (loading) return <p>Loading appointments...</p>;

  return (
    <div>
      {/* ✅ Add VisitorNavbar */}
      <VisitorNavbar fullName={fullName} />
      

      <div className="appointment-list-container">
        <h2>📅 My Appointments</h2>
        <table className="appointment-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Officer</th>
              <th>Department</th>
              <th>Service</th>
              <th>Date & Time</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.length === 0 ? (
              <tr>
                <td colSpan="7">No appointments found.</td>
              </tr>
            ) : (
              appointments.map((appt) => (
                <tr key={appt.appointment_id}>
                  <td>{appt.appointment_id}</td>
                  <td>{appt.officer_name}</td>
                  <td>{appt.department_name}</td>
                  <td>{appt.service_name}</td>
                  <td>
                    {appt.appointment_date} {appt.slot_time}
                  </td>
                  <td className={`status ${appt.status.toLowerCase()}`}>{appt.status}</td>
                  <td>
                    {appt.status === "pending" && (
                      <>
                        <button onClick={() => handleView(appt.appointment_id)}>View</button>
                        <button onClick={() => handleCancel(appt.appointment_id)}>Cancel</button>
                      </>
                    )}
                    {appt.status === "approved" && (
                      <button onClick={() => handleViewPass(appt.appointment_id)}>View Pass</button>
                    )}
                    {appt.status === "completed" && (
                      <button onClick={() => handleView(appt.appointment_id)}>View Details</button>
                    )}
                    {appt.status === "rejected" && <span>❌ Cancelled</span>}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AppointmentList;
