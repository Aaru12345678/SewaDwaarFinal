import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/AppointmentList.css";
import { getVisitorDashboard, cancelAppointment } from "../services/api";
import VisitorNavbar from "./VisitorNavbar";
import Swal from "sweetalert2";
import Header from "../Components/Header";
import NavbarTop from "../Components/NavbarTop";
import "./MainPage.css";

const AppointmentList = () => {
  const navigate = useNavigate();
  const username = localStorage.getItem("username");

  const [fullName, setFullName] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [walkins, setWalkins] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch appointments + walkins
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const { data, error } = await getVisitorDashboard(username);

        if (error || !data?.success) {
          Swal.fire("Error", "Failed to fetch appointments", "error");
          return;
        }

        setFullName(data.data.full_name || username);
        setAppointments(data.data.appointments || []);
        setWalkins(data.data.walkins || []);
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "Server error while fetching appointments", "error");
      } finally {
        setLoading(false);
      }
    };

    if (username) fetchData();
  }, [username]);

  // ✅ Merge Online + Walkins into ONE list
  const combinedAppointments = [
    ...(appointments || []).map((a) => ({
      ...a,
      rowType: "appointment",
      id: a.appointment_id,
      date: a.appointment_date,
    })),
    ...(walkins || []).map((w) => ({
      ...w,
      rowType: "walkin",
      id: w.walkin_id,
      date: w.walkin_date,
    })),
  ];

  // ✅ Sort by latest (optional)
  combinedAppointments.sort((a, b) => (b.id > a.id ? 1 : -1));

  // ✅ Cancel Appointment (ONLY for online appointments)
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
          if (!value) return "Reason is required!";
        },
      });

      if (!isConfirmed) return;

      const { data, error } = await cancelAppointment(id, reason);

      if (error || !data?.success) {
        Swal.fire("Error", "Failed to cancel appointment", "error");
        return;
      }

      // ✅ Update only online appointments state
      setAppointments((prev) =>
        prev.map((appt) =>
          appt.appointment_id === id ? { ...appt, status: "cancelled" } : appt
        )
      );

      Swal.fire("Cancelled!", "Your appointment has been cancelled.", "success");
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Server error while cancelling appointment", "error");
    }
  };

  // ✅ View handlers
  const handleViewPass = (id) => navigate(`/appointment-pass/${id}`);
  const handleView = (type, id) => {
    if (type === "walkin") navigate(`/appointment/${id}`);
    else navigate(`/appointment/${id}`);
  };

  const canCancel = (status) => ["pending", "rescheduled"].includes(status);
  const canViewPass = (status) => ["approved", "rescheduled"].includes(status);

  if (loading) return <p>Loading appointments...</p>;

  return (
    <>
      <div className="fixed-header">
        <NavbarTop />
        <Header />
        <VisitorNavbar fullName={fullName} />
      </div>

      <div className="main-layout">
        <div className="content-below">
          <div className="appointment-list-container">
            <h2>
              <span>
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
                  <th>Type</th>
                  <th>Officer</th>
                  <th>Department</th>
                  <th>Service</th>
                  <th>Date & Time</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {combinedAppointments.length === 0 ? (
                  <tr>
                    <td colSpan="8">No appointments found.</td>
                  </tr>
                ) : (
                  combinedAppointments.map((appt) => (
                    <tr key={appt.id}>
                      <td>{appt.id}</td>

                      <td style={{ fontWeight: 600 }}>
                        {appt.rowType === "walkin" ? "Walk-in" : "Online"}
                      </td>

                      <td>{appt.officer_name || "Helpdesk"}</td>
                      <td>{appt.department_name || "-"}</td>
                      <td>{appt.service_name || "-"}</td>

                      <td>
                        {appt.date || "-"} {appt.slot_time || ""}
                      </td>

                      <td className={`status ${appt.status?.toLowerCase()}`}>
                        {appt.status}
                      </td>

                      <td>
                        {/* ✅ VIEW */}
                        {appt.status !== "rejected" && (
                          <button onClick={() => handleView(appt.rowType, appt.id)}>
                            View
                          </button>
                        )}

                        {/* ✅ VIEW PASS (Only for Online) */}
                        {appt.rowType === "appointment" && canViewPass(appt.status) && (
                          <button
                            style={{ marginLeft: "5px" }}
                            onClick={() => handleViewPass(appt.appointment_id)}
                          >
                            View Pass
                          </button>
                        )}

                        {/* ✅ CANCEL (Only for Online) */}
                        {appt.rowType === "appointment" && canCancel(appt.status) && (
                          <button
                            style={{ marginLeft: "5px" }}
                            onClick={() => handleCancel(appt.appointment_id)}
                          >
                            Cancel
                          </button>
                        )}

                        {/* ✅ CANCELLED */}
                        {appt.status === "cancelled" && (
                          <button
                            disabled
                            style={{
                              cursor: "not-allowed",
                              opacity: 0.5,
                              marginLeft: "5px",
                            }}
                          >
                            Cancelled
                          </button>
                        )}

                        {/* ✅ REJECTED */}
                        {appt.status === "rejected" && (
                          <span style={{ color: "#d9534f", fontWeight: 600 }}>
                            ❌ Rejected
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default AppointmentList;
