import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getOfficerDashboard } from "../services/api";
import { toast } from "react-toastify";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import NavbarMain from '../Components/NavbarMain';
import NavbarTop from '../Components/NavbarTop';
import VisitorNavbar from "./VisitorNavbar";


import {
  FaCalendarDay, 
  FaClock, 
  FaCheckCircle, 
  FaWalking,
  FaArrowRight,
  FaUser,
  FaBell,
  FaSignOutAlt,
  FaRedo,
  FaCalendarCheck,
  FaCheck,
  FaTimes,
  FaCalendarAlt,
  FaSearch,
  FaFilePdf,
  FaFileExcel,
  FaDownload,
  FaEye,
  FaPhone,
  FaEnvelope,
  FaClipboardList,
  FaChartBar
} from "react-icons/fa";
import "../css/Dashboard.css";
import OfficerNavbar from "./OfficerNavbar";
import "../pages/MainPage.css"
function OfficerDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState("Officer");
  const [stats, setStats] = useState({
    today: 0,
    pending: 0,
    completed: 0,
    rescheduled: 0,
    walkins: 0,
  });
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [pendingAppointments, setPendingAppointments] = useState([]);
  const [rescheduledAppointments, setRescheduledAppointments] = useState([]);
  const [completedAppointments, setCompletedAppointments] = useState([]);
  const [walkinAppointments, setWalkinAppointments] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [activeTab, setActiveTab] = useState("today");
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleData, setRescheduleData] = useState({
    appointment_id: "",
    new_date: "",
    new_time: "",
    reason: "",
  });
  const [actionLoading, setActionLoading] = useState(false);
  
  // Date picker states for reports
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [dateAppointments, setDateAppointments] = useState([]);
  const [dateStats, setDateStats] = useState({ total: 0, pending: 0, approved: 0, completed: 0, rejected: 0 });
  const [dateLoading, setDateLoading] = useState(false);

  // View appointment modal
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // Reject modal with reason
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectData, setRejectData] = useState({
    appointment_id: "",
    reason: "",
  });

  const officer=localStorage.getItem("username")
  console.log(officer,"officerID")

  // const officerId = localStorage.getItem("officer_id");

  useEffect(() => {
    if (!officer) {
      navigate("/login/officerlogin");
      return;
    }

    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const { data, error } = await getOfficerDashboard(officer);
        console.log(data.pending_appointments,"dataaaa")

        
        // console.log(purpose,"purpose");
        if (error) {
          console.error("Failed to fetch dashboard:", error);
        } else if (data && data.success) {
          setFullName(data.data.full_name || "Officer");
          setStats(data.data.stats || { today: 0, pending: 0, completed: 0, rescheduled: 0, walkins: 0 });
          setTodayAppointments(data.data.today_appointments || []);
          setPendingAppointments(data.data.pending_appointments || []);
          setRescheduledAppointments(data.data.rescheduled_appointments || []);
          setCompletedAppointments(data.data.completed_appointments || []);
          setWalkinAppointments(data.data.walkin_appointments || []);
          setRecentActivity(data.data.recent_activity || []);
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      }
      setLoading(false);
    };

    fetchDashboardData();
  }, [officer, navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return "";
    const [hours, minutes] = timeStr.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const getStatusClass = (status) => {
    const statusMap = {
      pending: "pending",
      approved: "approved",
      completed: "completed",
      rejected: "rejected",
      rescheduled: "rescheduled",
    };
    return statusMap[status?.toLowerCase()] || "pending";
  };

  // Refresh dashboard data
  const refreshDashboard = async () => {
    try {
      const { data } = await getOfficerDashboard(officer);
      if (data && data.success) {
        setStats(data.data.stats || { today: 0, pending: 0, completed: 0, rescheduled: 0, walkins: 0 });
        setTodayAppointments(data.data.today_appointments || []);
        setPendingAppointments(data.data.pending_appointments || []);
        setRescheduledAppointments(data.data.rescheduled_appointments || []);
        setCompletedAppointments(data.data.completed_appointments || []);
        setWalkinAppointments(data.data.walkin_appointments || []);
        setRecentActivity(data.data.recent_activity || []);
      }
    } catch (err) {
      console.error("Refresh error:", err);
    }
  };

 
  // Fetch appointments for selected date
  const fetchAppointmentsByDate = async () => {
    if (!selectedDate) {
      toast.error("Please select a date");
      return;
    }
    
    setDateLoading(true);
    try {
      const response = await fetch(
        `http://localhost:5000/api/officer/${officer}/appointments-by-date?date=${selectedDate}`
      );
      const result = await response.json();
      console.log(result,"response")

      if (result.success) {
        setDateAppointments(result.data.appointments || []);
        setDateStats(result.data.stats || { total: 0, pending: 0, approved: 0, completed: 0, rejected: 0 });
      } else {
        toast.error(result.message || "Failed to fetch appointments");
      }
    } catch (err) {
      console.error("Error fetching appointments by date:", err);
      toast.error("Failed to fetch appointments");
    }
    setDateLoading(false);
  };

  // Download as PDF
  const downloadPDF = () => {
    if (dateAppointments.length === 0) {
      toast.warning("No appointments to download");
      return;
    }

    // Create printable HTML content
    const formattedDate = new Date(selectedDate).toLocaleDateString("en-IN", {
      day: "numeric", month: "long", year: "numeric"
    });
    
    const tableRows = dateAppointments.map((apt, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>${apt.visitor_name || "N/A"}</td>
        <td>${apt.visitor_mobile || "N/A"}</td>
        <td>${formatTime(apt.slot_time)}</td>
        <td>${apt.service_name || apt.department_name || "N/A"}</td>
        <td>${apt.purpose || "N/A"}</td>
        <td>${apt.status || "N/A"}</td>
      </tr>
    `).join("");

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Appointments Report - ${formattedDate}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #1a365d; text-align: center; }
          h2 { color: #2d3748; text-align: center; margin-bottom: 20px; }
          .stats { display: flex; justify-content: center; gap: 20px; margin-bottom: 20px; flex-wrap: wrap; }
          .stat-box { background: #f7fafc; padding: 10px 20px; border-radius: 8px; text-align: center; }
          .stat-box strong { display: block; font-size: 24px; color: #2b6cb0; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #e2e8f0; padding: 10px; text-align: left; }
          th { background: #2b6cb0; color: white; }
          tr:nth-child(even) { background: #f7fafc; }
          .footer { text-align: center; margin-top: 30px; color: #718096; font-size: 12px; }
        </style>
      </head>
      <body>
        <h1>🏛️ SewaDwaar - Appointments Report</h1>
        <h2>Date: ${formattedDate}</h2>
        <div class="stats">
          <div class="stat-box"><strong>${dateStats.total || 0}</strong>Total</div>
          <div class="stat-box"><strong>${dateStats.pending || 0}</strong>Pending</div>
          <div class="stat-box"><strong>${dateStats.approved || 0}</strong>Approved</div>
          <div class="stat-box"><strong>${dateStats.completed || 0}</strong>Completed</div>
          <div class="stat-box"><strong>${dateStats.rejected || 0}</strong>Rejected</div>
        </div>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Visitor Name</th>
              <th>Mobile</th>
              <th>Time</th>
              <th>Service</th>
              <th>Purpose</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
        <div class="footer">
          <p>Generated on ${new Date().toLocaleString("en-IN")}</p>
          <p>Officer: ${fullName}</p>
        </div>
      </body>
      </html>
    `;

    // Open print dialog
    const printWindow = window.open("", "_blank");
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
  };

  // Download as Excel (CSV format)
  const downloadExcel = () => {
    if (dateAppointments.length === 0) {
      toast.warning("No appointments to download");
      return;
    }

    const formattedDate = new Date(selectedDate).toLocaleDateString("en-IN", {
      day: "numeric", month: "long", year: "numeric"
    });

    // Create CSV content
    const headers = ["#", "Visitor Name", "Mobile", "Email", "Time", "Service", "Department", "Purpose", "Status"];
    const csvRows = [
      `SewaDwaar - Appointments Report for ${formattedDate}`,
      `Officer: ${fullName}`,
      `Generated: ${new Date().toLocaleString("en-IN")}`,
      "",
      `Total: ${dateStats.total || 0}, Pending: ${dateStats.pending || 0}, Approved: ${dateStats.approved || 0}, Completed: ${dateStats.completed || 0}, Rejected: ${dateStats.rejected || 0}`,
      "",
      headers.join(","),
      ...dateAppointments.map((apt, index) => [
        index + 1,
        `"${apt.visitor_name || "N/A"}"`,
        `"${apt.visitor_mobile || "N/A"}"`,
        `"${apt.visitor_email || "N/A"}"`,
        `"${formatTime(apt.slot_time)}"`,
        `"${apt.service_name || "N/A"}"`,
        `"${apt.department_name || "N/A"}"`,
        `"${apt.purpose || "N/A"}"`,
        `"${apt.status || "N/A"}"`
      ].join(","))
    ];

    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `appointments_${selectedDate}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Excel file downloaded successfully");
  };

  // Handle appointment status update (approve, complete)
  const handleUpdateStatus = async (appointmentId, status, reason = null) => {
    if (actionLoading) return;
    
    const confirmMsg = {
      approved: "Are you sure you want to approve this appointment?",
      completed: "Mark this appointment as completed?",
    };
    
    if (!window.confirm(confirmMsg[status] || "Update this appointment?")) return;
    
    setActionLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/appointment/update-status", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointment_id: appointmentId,
          status: status,
          officer_id: officer,
          reason: reason,
        }),
      });
      
      const text = await response.text();
 console.log(text,"text")
try {
  const result = JSON.parse(text);
  console.log(result,"result");
  if (result.success) {
    toast.success(result.message);
    await refreshDashboard();
  } else {
    toast.error(result.message || "Failed to update");
  }
} catch (e) {
  console.error("Server returned non-JSON:", text);
  toast.error("Server error. Please try again.");
}

    } catch (err) {
      console.error("Error updating status:", err);
      toast.error("Failed to update appointment");
    }
    setActionLoading(false);
  };

  // Open reject modal
  const openRejectModal = (appointmentId) => {
    setRejectData({
      appointment_id: appointmentId,
      reason: "",
    });
    setShowRejectModal(true);
  };

  // Handle rejection with reason
  const handleReject = async () => {
    if (!rejectData.reason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }
    
    setActionLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/appointment/update-status", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointment_id: rejectData.appointment_id,
          status: "rejected",
          officer_id: officer,
          reason: rejectData.reason,
        }),
      });
      
      const result = await response.json();
      if (result.success) {
        toast.success("Appointment rejected successfully");
        setShowRejectModal(false);
        setShowViewModal(false);
        await refreshDashboard();
      } else {
        toast.error(result.message || "Failed to reject");
      }
    } catch (err) {
      console.error("Error rejecting:", err);
      toast.error("Failed to reject appointment");
    }
    setActionLoading(false);
  };

  // Open view modal
  const openViewModal = (appointment) => {
    setSelectedAppointment(appointment);
    setShowViewModal(true);
  };

  // Open reschedule modal
  const openRescheduleModal = (appointmentId) => {
    setRescheduleData({
      appointment_id: appointmentId,
      new_date: "",
      new_time: "",
      reason: "",
    });
    setShowRescheduleModal(true);
  };

  // Handle reschedule submission
  const handleReschedule = async () => {
    if (!rescheduleData.new_date || !rescheduleData.new_time) {
      toast.error("Please select new date and time");
      return;
    }
    
    setActionLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/appointment/reschedule", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointment_id: rescheduleData.appointment_id,
          officer_id: officer,
          new_date: rescheduleData.new_date,
          new_time: rescheduleData.new_time,
          reason: rescheduleData.purpose,
        }),
      });
      
      const result = await response.json();
      if (result.success) {
        toast.success("Appointment rescheduled successfully");
        setShowRescheduleModal(false);
        setShowViewModal(false);
        await refreshDashboard();
      } else {
        toast.error(result.message || "Failed to reschedule");
      }
    } catch (err) {
      console.error("Error rescheduling:", err);
      toast.error("Failed to reschedule appointment");
    }
    setActionLoading(false);
  };

  const getActivityMessage = (item) => {
    const status = item.status?.toLowerCase();
    const visitor = item.visitor_name || "A visitor";
    switch (status) {
      case "pending":
        return `${visitor} requested an appointment`;
      case "approved":
        return `Appointment with ${visitor} approved`;
      case "completed":
        return `Completed appointment with ${visitor}`;
      case "rejected":
        return `Appointment with ${visitor} was declined`;
      case "rescheduled":
        return `Appointment with ${visitor} rescheduled`;
      default:
        return `${visitor} - ${item.purpose || "Appointment"}`;
    }
  };

  // Get current appointments based on active tab
  const getCurrentAppointments = () => {
    switch (activeTab) {
      case "today":
        return todayAppointments;
      case "pending":
        return pendingAppointments;
      case "rescheduled":
        return rescheduledAppointments;
      case "completed":
        return completedAppointments;
      case "walkins":
        return walkinAppointments;
      case "bydate":
        return dateAppointments;
      default:
        return todayAppointments;
    }
  };

  // Render action buttons based on status
  const renderActionButtons = (apt, showViewBtn = true) => {
    const status = apt.status?.toLowerCase();
    
    return (
      <div className="action-buttons">
        {/* View button always visible */}
        {showViewBtn && (
          <button
            className="action-btn view-btn"
            onClick={() => openViewModal(apt)}
            title="View Details"
          >
            <FaEye />
          </button>
        )}
        
        {status === "completed" && (
          <span className="completed-text">✓ Completed</span>
        )}
        
        {status === "rejected" && (
          <span className="rejected-text">✗ Rejected</span>
        )}
        
        {(status === "pending" || status === "rescheduled") && (
          <>
            <button
              className="action-btn approve-btn"
              onClick={() => handleUpdateStatus(apt.appointment_id, "approved")}
              disabled={actionLoading}
              title="Approve"
            >
              <FaCheck />
            </button>
            <button
              className="action-btn reject-btn"
              onClick={() => openRejectModal(apt.appointment_id)}
              disabled={actionLoading}
              title="Reject"
            >
              <FaTimes />
            </button>
            <button
              className="action-btn reschedule-btn"
              onClick={() => openRescheduleModal(apt.appointment_id)}
              disabled={actionLoading}
              title="Reschedule"
            >
              <FaCalendarAlt />
            </button>
          </>
        )}
        {status === "approved" && (
          <button
            className="action-btn complete-btn"
            onClick={() => handleUpdateStatus(apt.appointment_id, "completed")}
            disabled={actionLoading}
            title="Mark Complete"
          >
            <FaCheckCircle /> Complete
          </button>
        )}
      </div>
    );
  };

  // Render the appointments table
  const renderAppointmentsTable = () => {
    const appointments = getCurrentAppointments();
    
    if (appointments.length === 0) {
      return (
        <div className="empty-state">
          <FaCalendarCheck className="empty-icon" />
          <p>
            {activeTab === "today" && "No appointments scheduled for today."}
            {activeTab === "pending" && "No pending appointments."}
            {activeTab === "rescheduled" && "No rescheduled appointments."}
            {activeTab === "completed" && "No completed appointments yet."}
            {activeTab === "walkins" && "No walk-in appointments."}
            {activeTab === "bydate" && "No appointments found for the selected date. Try searching for a different date."}
          </p>
        </div>
      );
    }

    return (
      <div className="appointments-table-wrapper">
        <table className="appointments-table">
          <thead>
            <tr>
              <th>Visitor</th>
              <th>Date</th>
              <th>Time</th>
              <th>Service</th>
              <th>Purpose</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((apt) => (
              <tr key={apt.appointment_id} className={`appointment-row ${getStatusClass(apt.status)}`}>
                <td>
                  <div className="visitor-info">
                    <span className="visitor-name">{apt.visitor_name || "Visitor"}</span>
                    {apt.visitor_mobile && (
                      <span className="visitor-mobile">{apt.visitor_mobile}</span>
                    )}
                  </div>
                </td>
                <td>{formatDate(apt.appointment_date)}</td>
                <td>{formatTime(apt.slot_time)}</td>
                <td className="service-cell">{apt.service_id || apt.department_id || apt.service_name || "-"}</td>
                <td className="purpose-cell">{apt.purpose || "-"}</td>
                <td>
                  <span className={`status-badge ${getStatusClass(apt.status)}`}>
                    {apt.status}
                  </span>
                </td>
                <td>
                  {renderActionButtons(apt)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loader-spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="fixed-header">
        <NavbarTop/>
        <Header />
      <OfficerNavbar fullName={fullName} />
        
      </div>
      <div className="main-layout">
  <div className="content-below">
      <div className="dashboard-container">
      {/* Top Navigation Bar */}
      {/* <nav className="dashboard-nav">
        <div className="nav-brand">
          <span className="brand-icon">🏛️</span>
          <span className="brand-text">SewaDwaar</span>
        </div>
        <div className="nav-actions">
          <Link to="/officer/reports" className="nav-icon-btn" title="Reports">
            <FaChartBar />
          </Link>
          <Link to="/officer/notifications2" className="nav-icon-btn" title="Notifications">
            <FaBell />
            {stats.pending > 0 && <span className="badge">{stats.pending}</span>}
          </Link>
          <div className="nav-user">
            <FaUser />
            <span>{fullName}</span>
          </div>
          <button className="nav-icon-btn logout-btn" onClick={handleLogout} title="Logout">
            <FaSignOutAlt />
          </button>
        </div>
      </nav> */}

      <div className="dashboard-content">
        {/* Welcome Header */}
        <header className="dashboard-header">
          <div className="header-text">
            <h1>Welcome back, {fullName.split(" ")[0]}!</h1>
            <p>Here's what's happening with your appointments today.</p>
          </div>
          <div className="header-date">
            <span className="date-day">{new Date().toLocaleDateString("en-IN", { weekday: "long" })}</span>
            <span className="date-full">{new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</span>
          </div>
        </header>

        {/* Stats Cards */}
        <section className="stats-grid">
          <div onClick={() => setActiveTab("today")} className={`stat-card today ${activeTab === "today" ? "active" : ""}`}>
            <div className="stat-icon">
              <FaCalendarDay />
            </div>
            <div className="stat-info">
              <span className="stat-number">{stats.today}</span>
              <span className="stat-label">Today's Appointments</span>
            </div>
            <FaArrowRight className="stat-arrow" />
          </div>

          <div onClick={() => setActiveTab("pending")} className={`stat-card pending ${activeTab === "pending" ? "active" : ""}`}>
            <div className="stat-icon">
              <FaClock />
            </div>
            <div className="stat-info">
              <span className="stat-number">{stats.pending}</span>
              <span className="stat-label">Pending Requests</span>
            </div>
            <FaArrowRight className="stat-arrow" />
          </div>

          <div onClick={() => setActiveTab("rescheduled")} className={`stat-card rescheduled ${activeTab === "rescheduled" ? "active" : ""}`}>
            <div className="stat-icon">
              <FaRedo />
            </div>
            <div className="stat-info">
              <span className="stat-number">{stats.rescheduled}</span>
              <span className="stat-label">Rescheduled</span>
            </div>
            <FaArrowRight className="stat-arrow" />
          </div>

          <div onClick={() => setActiveTab("walkins")} className={`stat-card walkins ${activeTab === "walkins" ? "active" : ""}`}>
            <div className="stat-icon">
              <FaWalking />
            </div>
            <div className="stat-info">
              <span className="stat-number">{stats.walkins}</span>
              <span className="stat-label">Walk-ins</span>
            </div>
            <FaArrowRight className="stat-arrow" />
          </div>

          <div onClick={() => setActiveTab("completed")} className={`stat-card completed ${activeTab === "completed" ? "active" : ""}`}>
            <div className="stat-icon">
              <FaCheckCircle />
            </div>
            <div className="stat-info">
              <span className="stat-number">{stats.completed}</span>
              <span className="stat-label">Completed</span>
            </div>
            <FaArrowRight className="stat-arrow" />
          </div>
        </section>

        {/* Main Content Grid */}
        <div className="dashboard-grid">
          {/* Appointments Section with Tabs */}
          <section className="upcoming-section">
            <div className="section-header">
              <h2>
                {activeTab === "today" && "📅 Today's Appointments"}
                {activeTab === "pending" && "⏳ Pending Appointments"}
                {activeTab === "rescheduled" && "🔄 Rescheduled Appointments"}
                {activeTab === "completed" && "✅ Completed Appointments"}
                {activeTab === "walkins" && "🚶 Walk-in Appointments"}
                {activeTab === "bydate" && "📊 Appointments by Date"}
              </h2>
              <div className="tab-pills">
                <button 
                  className={`tab-pill ${activeTab === "today" ? "active" : ""}`}
                  onClick={() => setActiveTab("today")}
                >
                  Today ({stats.today})
                </button>
                <button 
                  className={`tab-pill ${activeTab === "pending" ? "active" : ""}`}
                  onClick={() => setActiveTab("pending")}
                >
                  Pending ({stats.pending})
                </button>
                <button 
                  className={`tab-pill ${activeTab === "rescheduled" ? "active" : ""}`}
                  onClick={() => setActiveTab("rescheduled")}
                >
                  Rescheduled ({stats.rescheduled})
                </button>
                <button 
                  className={`tab-pill ${activeTab === "completed" ? "active" : ""}`}
                  onClick={() => setActiveTab("completed")}
                >
                  Completed ({stats.completed})
                </button>
                <button 
                  className={`tab-pill ${activeTab === "walkins" ? "active" : ""}`}
                  onClick={() => setActiveTab("walkins")}
                >
                  Walk-ins ({stats.walkins})
                </button>
                <button 
                  className={`tab-pill ${activeTab === "bydate" ? "active" : ""}`}
                  onClick={() => setActiveTab("bydate")}
                >
                  <FaSearch style={{ marginRight: "4px" }} /> By Date
                </button>
              </div>
            </div>
            
            {/* Date picker section for "By Date" tab */}
            {activeTab === "bydate" && (
              <div className="date-picker-section">
                <div className="date-picker-controls">
                  <div className="date-input-group">
                    <label>Select Date:</label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="date-input"
                    />
                    <button 
                      className="search-btn"
                      onClick={fetchAppointmentsByDate}
                      disabled={dateLoading}
                    >
                      {dateLoading ? "Loading..." : <><FaSearch /> Search</>}
                    </button>
                  </div>
                  
                  {dateAppointments.length > 0 && (
                    <div className="download-buttons">
                      <button className="download-btn pdf-btn" onClick={downloadPDF}>
                        <FaFilePdf /> Download PDF
                      </button>
                      <button className="download-btn excel-btn" onClick={downloadExcel}>
                        <FaFileExcel /> Download Excel
                      </button>
                    </div>
                  )}
                </div>
                
                {dateAppointments.length > 0 && (
                  <div className="date-stats-bar">
                    <span className="date-stat">Total: <strong>{dateStats.total || 0}</strong></span>
                    <span className="date-stat pending">Pending: <strong>{dateStats.pending || 0}</strong></span>
                    <span className="date-stat approved">Approved: <strong>{dateStats.approved || 0}</strong></span>
                    <span className="date-stat completed">Completed: <strong>{dateStats.completed || 0}</strong></span>
                    <span className="date-stat rejected">Rejected: <strong>{dateStats.rejected || 0}</strong></span>
                  </div>
                )}
              </div>
            )}
            
            {/* Render appointments based on active tab */}
            {renderAppointmentsTable()}
          </section>

          {/* Recent Activity Panel */}
          <aside className="activity-section">
            <div className="section-header">
              <h2>🔔 Recent Activity</h2>
            </div>
            
            {recentActivity.length > 0 ? (
              <ul className="activity-list">
                {recentActivity.map((item, index) => (
                  <li key={item.appointment_id || index} className={`activity-item ${getStatusClass(item.status)}`}>
                    <div className="activity-dot"></div>
                    <div className="activity-content">
                      <p className="activity-message">{getActivityMessage(item)}</p>
                      <span className="activity-time">
                        {formatDate(item.appointment_date)} at {formatTime(item.slot_time)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="empty-state">
                <p>No recent activity.</p>
              </div>
            )}

            <Link to="/officer/notifications2" className="view-all-btn">
              View All Notifications
            </Link>
          </aside>
        </div>
      </div>

      {/* Reschedule Modal */}
      {showRescheduleModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>📅 Reschedule Appointment</h3>
              <button 
                className="modal-close" 
                onClick={() => setShowRescheduleModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>New Date *</label>
                <input
                  type="date"
                  value={rescheduleData.new_date}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setRescheduleData(prev => ({ ...prev, new_date: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label>New Time *</label>
                <input
                  type="time"
                  value={rescheduleData.new_time}
                  onChange={(e) => setRescheduleData(prev => ({ ...prev, new_time: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label>Reason (Optional)</label>
                <textarea
                  value={rescheduleData.purpose}
                  onChange={(e) => setRescheduleData(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="Enter reason for rescheduling..."
                  rows={3}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn-secondary" 
                onClick={() => setShowRescheduleModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn-primary" 
                onClick={handleReschedule}
                disabled={actionLoading}
              >
                {actionLoading ? "Saving..." : "Reschedule"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Appointment Modal */}
      {showViewModal && selectedAppointment && (
        <div className="modal-overlay">
          <div className="modal-content view-modal">
            <div className="modal-header">
              <h3>📋 Appointment Details</h3>
              <button 
                className="modal-close" 
                onClick={() => setShowViewModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              {/* Status Badge */}
              <div className="view-status-section">
                <span className={`status-badge large ${getStatusClass(selectedAppointment.status)}`}>
                  {selectedAppointment.status}
                </span>
              </div>

              {/* Visitor Information */}
              <div className="view-section">
                <h4><FaUser /> Visitor Information</h4>
                <div className="view-details-grid">
                  <div className="view-detail">
                    <span className="label">Name</span>
                    <span className="value">{selectedAppointment.visitor_name || "N/A"}</span>
                  </div>
                  <div className="view-detail">
                    <span className="label"><FaPhone /> Mobile</span>
                    <span className="value">{selectedAppointment.visitor_mobile || "N/A"}</span>
                  </div>
                  <div className="view-detail">
                    <span className="label"><FaEnvelope /> Email</span>
                    <span className="value">{selectedAppointment.visitor_email || "N/A"}</span>
                  </div>
                </div>
              </div>

              {/* Appointment Information */}
              <div className="view-section">
                <h4><FaCalendarAlt /> Appointment Information</h4>
                <div className="view-details-grid">
                  <div className="view-detail">
                    <span className="label">Appointment ID</span>
                    <span className="value">{selectedAppointment.appointment_id}</span>
                  </div>
                  <div className="view-detail">
                    <span className="label">Date</span>
                    <span className="value">{formatDate(selectedAppointment.appointment_date)}</span>
                  </div>
                  <div className="view-detail">
                    <span className="label">Time</span>
                    <span className="value">{formatTime(selectedAppointment.slot_time)}</span>
                  </div>
                  <div className="view-detail">
                    <span className="label">Department</span>
                    <span className="value">{selectedAppointment.department_id || selectedAppointment.department_name}</span>
                  </div>
                  <div className="view-detail">
                    <span className="label">Service</span>
                    <span className="value">{selectedAppointment.service_id || selectedAppointment.service_name}</span>
                  </div>
                </div>
              </div>

              {/* Purpose */}
              <div className="view-section">
                <h4><FaClipboardList /> Purpose of Visit</h4>
                <div className="view-purpose">
                  {selectedAppointment.purpose || "No purpose specified"}
                </div>
              </div>

              {/* Reschedule Reason if any */}
              {selectedAppointment.reschedule_reason && (
                <div className="view-section">
                  <h4>📝 Notes / Reason</h4>
                  <div className="view-purpose">
                    {selectedAppointment.reschedule_reason}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons in Modal */}
            <div className="modal-footer view-modal-footer">
              <button 
                className="btn-secondary" 
                onClick={() => setShowViewModal(false)}
              >
                Close
              </button>
              
              {/* Show action buttons based on status */}
              {(selectedAppointment.status?.toLowerCase() === "pending" || 
                selectedAppointment.status?.toLowerCase() === "rescheduled") && (
                <>
                  <button 
                    className="btn-success"
                    onClick={() => handleUpdateStatus(selectedAppointment.appointment_id, "approved")}
                    disabled={actionLoading}
                  >
                    <FaCheck /> Approve
                  </button>
                  <button 
                    className="btn-warning"
                    onClick={() => {
                      setShowViewModal(false);
                      openRescheduleModal(selectedAppointment.appointment_id);
                    }}
                    disabled={actionLoading}
                  >
                    <FaCalendarAlt /> Reschedule
                  </button>
                  <button 
                    className="btn-danger"
                    onClick={() => {
                      setShowViewModal(false);
                      openRejectModal(selectedAppointment.appointment_id);
                    }}
                    disabled={actionLoading}
                  >
                    <FaTimes /> Reject
                  </button>
                </>
              )}
              
              {selectedAppointment.status?.toLowerCase() === "approved" && (
                <button 
                  className="btn-success"
                  onClick={() => handleUpdateStatus(selectedAppointment.appointment_id, "completed")}
                  disabled={actionLoading}
                >
                  <FaCheckCircle /> Mark Complete
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal with Reason */}
      {showRejectModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header reject-header">
              <h3>❌ Reject Appointment</h3>
              <button 
                className="modal-close" 
                onClick={() => setShowRejectModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <p className="reject-warning">
                Please provide a reason for rejecting this appointment. This will be communicated to the visitor.
              </p>
              <div className="form-group">
                <label>Reason for Rejection *</label>
                <textarea
                  value={rejectData.reason}
                  onChange={(e) => setRejectData(prev => ({ ...prev, reason: e.target.value }))}
                  placeholder="Enter the reason for rejection..."
                  rows={4}
                  required
                />
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn-secondary" 
                onClick={() => setShowRejectModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn-danger" 
                onClick={handleReject}
                disabled={actionLoading || !rejectData.reason.trim()}
              >
                {actionLoading ? "Rejecting..." : "Confirm Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
      <Footer />
      </div>
    </div>
    </div>
  );

}
export default OfficerDashboard;