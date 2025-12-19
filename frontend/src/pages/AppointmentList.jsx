

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/AppointmentList.css";
import { getVisitorDashboard, cancelAppointment } from "../services/api";
import VisitorNavbar from "./VisitorNavbar";

const AppointmentList = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const username = localStorage.getItem("username");

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // ============================
  // Fetch appointments
  // ============================
  useEffect(() => {
    const fetchData = async () => {
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

    if (username) fetchData();
  }, [username]);

  // ============================
  // Cancel Appointment
  // ============================
  const handleCancel = async (id) => {
    const ok = window.confirm("Are you sure you want to cancel this appointment?");
    if (!ok) return;

    try {
      const { data, error } = await cancelAppointment(id);

      if (error) {
        console.error(error);
        alert("Failed to cancel appointment");
        return;
      }

      if (!data?.success) {
        alert(`Failed to cancel appointment: ${data?.message || "Unknown error"}`);
        return;
      }

      alert("Appointment cancelled successfully!");

      // Update UI immediately
      setAppointments((prev) =>
        prev.map((appt) =>
          appt.appointment_id === id
            ? { ...appt, status: "cancelled" }
            : appt
        )
      );
    } catch (err) {
      console.error("Cancel appointment error:", err);
      alert("Failed to cancel appointment due to server error");
    }
  };

  const handleViewPass = (id) => navigate(`/appointment-pass/${id}`);
  const handleView = (id) => navigate(`/appointment/${id}`);

  if (loading) return <p>Loading appointments...</p>;

  return (
    <div>
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

                  <td className={`status ${appt.status.toLowerCase()}`}>
                    {appt.status}
                  </td>

                  <td>
                    {appt.status === "pending" && (
                      <>
                        <button onClick={() => handleView(appt.appointment_id)}>View</button>
                        <button onClick={() => handleCancel(appt.appointment_id)}>Cancel</button>
                      </>
                    )}

                    {appt.status === "cancelled" && (
                      <>
                        <button onClick={() => handleView(appt.appointment_id)}>View</button>
                        <button
                          disabled
                          style={{ cursor: "not-allowed", opacity: 0.5, marginLeft: "5px" }}
                        >
                          Cancel
                        </button>
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
