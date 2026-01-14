import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/AppointmentList.css";
import { getVisitorDashboard, cancelAppointment } from "../services/api";
import VisitorNavbar from "./VisitorNavbar";
import Swal from "sweetalert2";
import Header from '../Components/Header';
import NavbarMain from '../Components/NavbarMain';
import Footer from '../Components/Footer';
import './MainPage.css';
import NavbarTop from '../Components/NavbarTop';


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
        Swal.fire("Error", "Failed to fetch appointments", "error");
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
    try {
      const { value: reason, isConfirmed } = await Swal.fire({
        title: "Cancel Appointment",
        text: "Please provide a reason for cancelling:",
        input: "textarea",
        inputPlaceholder: "Enter cancelled reason...",
        showCancelButton: true,
        confirmButtonText: "Cancel Appointment",
        cancelButtonText: "Keep Appointment",
        inputValidator: (value) => {
          if (!value) {
            return "Reason is required!";
          }
        },
      });

      if (!isConfirmed) return;

      const { data, error } = await cancelAppointment(id, reason);

      if (error || !data?.success) {
        Swal.fire("Error", "Failed to cancel appointment", "error");
        return;
      }

      setAppointments((prev) =>
        prev.map((appt) =>
          appt.appointment_id === id
            ? { ...appt, status: "cancelled" }
            : appt
        )
      );

      Swal.fire("Cancelled!", "Your appointment has been cancelled.", "success");
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Server error while cancelling appointment", "error");
    }
  };

  const handleViewPass = (id) => navigate(`/appointment-pass/${id}`);
  const handleView = (id) => navigate(`/appointment/${id}`);

  if (loading) return <p>Loading appointments...</p>;

  return (
    <>
      <div className="fixed-header">
        <NavbarTop/>
        <Header />
      <VisitorNavbar fullName={fullName} />
        
      </div>
<div className="main-layout">
  <div className="content-below">

      <div className="appointment-list-container">
        <h2><span>    
          <button className="back-btn" onClick={() => navigate(-1)}>
                ← Back
          </button>
        </span>
        📅 My Appointments
        </h2>

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
                  <td>{appt.officer_name || "Helpdesk" }</td>
                  <td>{appt.department_name || "Booked by service"}</td>
                  <td>{appt.service_name}</td>
                  <td>
                    {appt.appointment_date} {appt.slot_time}
                  </td>

                  <td className={`status ${appt.status.toLowerCase()}`}>
                    {appt.status}
                  </td>

                  <td>
                    {/* PENDING */}
                    {appt.status === "pending" && (
                      <>
                        <button onClick={() => handleView(appt.appointment_id)}>
                          View
                        </button>
                        <button
                          onClick={() => handleCancel(appt.appointment_id)}
                          style={{ marginLeft: "5px" }}
                        >
                          Cancel
                        </button>
                      </>
                    )}

                    {/* APPROVED → VIEW PASS */}
                    {appt.status === "approved" && (
                      <button onClick={() => handleViewPass(appt.appointment_id)}>
                        View Pass
                      </button>
                    )}

                    {/* CANCELLED */}
                    {appt.status === "cancelled" && (
                      <>
                        <button onClick={() => handleView(appt.appointment_id)}>
                          View
                        </button>
                        <button
                          disabled
                          style={{
                            cursor: "not-allowed",
                            opacity: 0.5,
                            marginLeft: "5px",
                          }}
                        >
                          Cancel
                        </button>
                      </>
                    )}

                    {/* COMPLETED */}
                    {appt.status === "completed" && (
                      <button onClick={() => handleView(appt.appointment_id)}>
                        View Details
                      </button>
                    )}

                    {/* REJECTED */}
                    {appt.status === "rejected" && <span>❌ Cancelled</span>}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      </div></div>
    </>
  );
};

export default AppointmentList;
