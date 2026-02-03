import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/AppointmentList.css";
import { getVisitorDashboard, cancelAppointment,getVisitorProfile} from "../services/api";
import VisitorNavbar from "./VisitorNavbar";
import Swal from "sweetalert2";
import Header from "../Components/Header";
import NavbarTop from "../Components/NavbarTop";
import "./MainPage.css";

const ITEMS_PER_PAGE = 5;

const AppointmentList = () => {
  const navigate = useNavigate();
  const username = localStorage.getItem("username");

  const [fullName, setFullName] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [sortAsc, setSortAsc] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
const [visitor, setVisitor] = useState(null);

  /* ================= Date Group ================= */
  const getDateGroup = (date) => {
    const today = new Date();
    const d = new Date(date);

    if (d.toDateString() === today.toDateString()) return "Today";

    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString())
      return "Yesterday";

    return "Older";
  };

  /* ================= Fetch Appointments ================= */
useEffect(() => {
  const fetchProfile = async () => {
    try {
      const res = await getVisitorProfile(username);
      if (res.data?.success) {
        setVisitor(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  fetchProfile();
}, [username]);



  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const { data, error } = await getVisitorDashboard(username);

      if (error) {
        Swal.fire("Error", "Failed to fetch appointments", "error");
      } else if (data?.success) {
        setFullName(data.data.full_name || username);
        setAppointments(data.data.appointments || []);
      }

      setLoading(false);
    };

    if (username) fetchData();
  }, [username]);

  /* ================= Cancel Appointment ================= */
  const handleCancel = async (id) => {
    const { value: reason, isConfirmed } = await Swal.fire({
      title: "Cancel Appointment",
      input: "textarea",
      inputPlaceholder: "Enter cancellation reason...",
      showCancelButton: true,
      confirmButtonText: "Cancel Appointment",
      inputValidator: (v) => (!v ? "Reason is required!" : null),
    });

    if (!isConfirmed) return;

    const { data } = await cancelAppointment(id, reason);

    if (!data?.success) {
      Swal.fire("Error", "Failed to cancel appointment", "error");
      return;
    }

    setAppointments((prev) =>
      prev.map((a) =>
        a.appointment_id === id
          ? { ...a, status: "cancelled" }
          : a
      )
    );

    Swal.fire("Cancelled", "Appointment cancelled", "success");
  };

  /* ================= Filters + Sorting ================= */
  const filteredAppointments = appointments
    .filter((a) =>
      statusFilter === "all"
        ? true
        : a.status === statusFilter
    )
    .sort((a, b) => {
      const d1 = new Date(`${a.appointment_date} ${a.slot_time}`);
      const d2 = new Date(`${b.appointment_date} ${b.slot_time}`);
      return sortAsc ? d1 - d2 : d2 - d1;
    });

  /* ================= Pagination ================= */
  const totalPages = Math.ceil(
    filteredAppointments.length / ITEMS_PER_PAGE
  );

  const paginated = filteredAppointments.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  /* ================= Group ================= */
  const grouped = paginated.reduce((g, a) => {
    const key = getDateGroup(a.appointment_date);
    if (!g[key]) g[key] = [];
    g[key].push(a);
    return g;
  }, {});

  const handleViewPass = (id) => navigate(`/appointment-pass/${id}`);
  const handleView = (id) => navigate(`/appointment/${id}`);

  if (loading) return <p>Loading appointments...</p>;

  return (
    <>
      <div className="fixed-header">
        <NavbarTop />
        <Header />
         <VisitorNavbar
  fullName={fullName}
  photo={visitor?.photo || visitor?.photo_url}
/>
      </div>

      <div className="main-layout">
        <div className="content-below">
          <div className="appointment-list-container">
            <h2>
              <button
                className="back-btn"
                onClick={() => navigate(-1)}
              >
                ← Back
              </button>{" "}
              📅 My Appointments
            </h2>

            {/* Filters */}
            <div className="filters">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rescheduled">Rescheduled</option>
                <option value="cancelled">Cancelled</option>
                <option value="rejected">Rejected</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {Object.entries(grouped).map(
              ([group, items]) => (
                <div key={group}>
                  <h4 className="date-heading">{group}</h4>

                  <table className="appointment-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Officer</th>
                        <th>Department</th>
                        <th>Service</th>
                        <th
                          style={{ cursor: "pointer" }}
                          onClick={() =>
                            setSortAsc((p) => !p)
                          }
                        >
                          Date & Time{" "}
                          {sortAsc ? "▲" : "▼"}
                        </th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {items.map((appt) => (
                        <tr key={appt.appointment_id}>
                          <td>{appt.appointment_id}</td>
                          <td>{appt.officer_name || "Helpdesk"}</td>
                          <td>{appt.department_name}</td>
                          <td>{appt.service_name}</td>
                          <td>
                            {appt.appointment_date}{" "}
                            {appt.slot_time}
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
                      <>
                        <button onClick={() => handleViewPass(appt.appointment_id)}>
                          View Pass
                        </button>
                        <button
                          onClick={() => handleCancel(appt.appointment_id)}
                          style={{ marginLeft: "5px" }}
                        >
                          Cancel
                        </button>
                      </>
                    )}

{appt.status === "rescheduled" && (
                      <>
                        <button onClick={() => handleViewPass(appt.appointment_id)}>
                          View Pass
                        </button>
                        <button
                          onClick={() => handleCancel(appt.appointment_id)}
                          style={{ marginLeft: "5px" }}
                        >
                          Cancel
                        </button>
                      </>
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
                      <>
                      <button onClick={() => handleView(appt.appointment_id)}>
                        View Details
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
               
                {/* Expired */}
{appt.status === "expired" && (
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

                    {/* REJECTED */}
                    {appt.status === "rejected" && (
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
                  </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  disabled={currentPage === 1}
                  onClick={() =>
                    setCurrentPage((p) => p - 1)
                  }
                >
                  ◀ Prev
                </button>

                <span>
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  disabled={currentPage === totalPages}
                  onClick={() =>
                    setCurrentPage((p) => p + 1)
                  }
                >
                  Next ▶
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AppointmentList;