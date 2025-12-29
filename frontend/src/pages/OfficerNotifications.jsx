import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getOfficerDashboard } from "../services/api";
import { 
  FaBell, 
  FaUser, 
  FaSignOutAlt, 
  FaArrowLeft,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaRedo,
  FaCalendarCheck
} from "react-icons/fa";
import "../css/Dashboard.css";

const OfficerNotifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState("Officer");
  
  const officerId = localStorage.getItem("username");

  useEffect(() => {
    if (!officerId) {
      navigate("/login/officerlogin");
      return;
    }

    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const { data, error } = await getOfficerDashboard(officerId);

        if (error) {
          console.error("Failed to fetch notifications:", error);
        } else if (data && data.success) {
          setFullName(data.data.full_name || "Officer");
          // Combine all appointments as notifications
          const allAppointments = [
            ...(data.data.pending_appointments || []),
            ...(data.data.today_appointments || []),
            ...(data.data.rescheduled_appointments || []),
            ...(data.data.completed_appointments || []),
          ];
          
          // Sort by date (newest first) and limit to recent ones
          const sortedAppointments = allAppointments
            .sort((a, b) => new Date(b.appointment_date) - new Date(a.appointment_date))
            .slice(0, 50);
          
          setNotifications(sortedAppointments);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      }
      setLoading(false);
    };

    fetchNotifications();
  }, [officerId, navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return "";
    const [hours, minutes] = timeStr.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return <FaCheckCircle className="status-icon completed" />;
      case "pending":
        return <FaClock className="status-icon pending" />;
      case "rejected":
        return <FaTimesCircle className="status-icon rejected" />;
      case "rescheduled":
        return <FaRedo className="status-icon rescheduled" />;
      case "approved":
        return <FaCalendarCheck className="status-icon approved" />;
      default:
        return <FaBell className="status-icon" />;
    }
  };

  const getNotificationMessage = (apt) => {
    const status = apt.status?.toLowerCase();
    const visitor = apt.visitor_name || "A visitor";
    switch (status) {
      case "pending":
        return `${visitor} has requested an appointment`;
      case "approved":
        return `Appointment with ${visitor} has been approved`;
      case "completed":
        return `Appointment with ${visitor} has been completed`;
      case "rejected":
        return `Appointment with ${visitor} was declined`;
      case "rescheduled":
        return `Appointment with ${visitor} has been rescheduled`;
      default:
        return `Appointment update from ${visitor}`;
    }
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

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loader-spinner"></div>
        <p>Loading notifications...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Top Navigation Bar */}
      <nav className="dashboard-nav">
        <div className="nav-brand">
          <span className="brand-icon">🏛️</span>
          <span className="brand-text">SewaDwaar</span>
        </div>
        <div className="nav-actions">
          <Link to="/dashboard" className="nav-icon-btn" title="Dashboard">
            <FaArrowLeft />
          </Link>
          <div className="nav-user">
            <FaUser />
            <span>{fullName}</span>
          </div>
          <button className="nav-icon-btn logout-btn" onClick={handleLogout} title="Logout">
            <FaSignOutAlt />
          </button>
        </div>
      </nav>

      <div className="dashboard-content">
        {/* Header */}
        <header className="dashboard-header">
          <div className="header-text">
            <h1>🔔 Notifications</h1>
            <p>Stay updated with your appointment activities</p>
          </div>
          <Link to="/dashboard" className="back-link">
            <FaArrowLeft /> Back to Dashboard
          </Link>
        </header>

        {/* Notifications List */}
        <section className="upcoming-section">
          <div className="section-header">
            <h2>Recent Activity</h2>
          </div>

          {notifications.length === 0 ? (
            <div className="empty-state">
              <FaBell className="empty-icon" />
              <p>No notifications yet.</p>
            </div>
          ) : (
            <div className="officer-notifications-list">
              {notifications.map((apt, index) => (
                <div 
                  key={apt.appointment_id || index} 
                  className={`officer-notification-item ${getStatusClass(apt.status)}`}
                >
                  <div className="notification-icon">
                    {getStatusIcon(apt.status)}
                  </div>
                  <div className="notification-content">
                    <p className="notification-message">{getNotificationMessage(apt)}</p>
                    <div className="notification-details">
                      <span className="notification-service">
                        {apt.service_name || apt.department_name || apt.purpose || "Appointment"}
                      </span>
                      <span className="notification-time">
                        {formatDate(apt.appointment_date)} at {formatTime(apt.slot_time)}
                      </span>
                    </div>
                    {apt.visitor_mobile && (
                      <span className="notification-contact">📞 {apt.visitor_mobile}</span>
                    )}
                  </div>
                  <div className="notification-status">
                    <span className={`status-badge ${getStatusClass(apt.status)}`}>
                      {apt.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <style jsx="true">{`
        .back-link {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--primary);
          text-decoration: none;
          font-weight: 500;
          padding: 10px 16px;
          background: var(--primary-light);
          border-radius: 8px;
          transition: all 0.2s;
        }
        
        .back-link:hover {
          background: var(--primary);
          color: white;
        }

        .officer-notifications-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .officer-notification-item {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          padding: 16px 20px;
          background: white;
          border-radius: 12px;
          border-left: 4px solid var(--gray-300);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
          transition: all 0.2s;
        }

        .officer-notification-item:hover {
          transform: translateX(4px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .officer-notification-item.pending {
          border-left-color: var(--warning);
        }

        .officer-notification-item.approved {
          border-left-color: var(--info);
        }

        .officer-notification-item.completed {
          border-left-color: var(--success);
        }

        .officer-notification-item.rejected {
          border-left-color: var(--danger);
        }

        .officer-notification-item.rescheduled {
          border-left-color: #8b5cf6;
        }

        .notification-icon {
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--gray-100);
          border-radius: 10px;
          flex-shrink: 0;
        }

        .status-icon {
          font-size: 20px;
          color: var(--gray-500);
        }

        .status-icon.pending {
          color: var(--warning);
        }

        .status-icon.approved {
          color: var(--info);
        }

        .status-icon.completed {
          color: var(--success);
        }

        .status-icon.rejected {
          color: var(--danger);
        }

        .status-icon.rescheduled {
          color: #8b5cf6;
        }

        .notification-content {
          flex: 1;
        }

        .notification-message {
          font-size: 15px;
          font-weight: 500;
          color: var(--gray-900);
          margin: 0 0 8px 0;
        }

        .notification-details {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
          margin-bottom: 4px;
        }

        .notification-service {
          font-size: 13px;
          color: var(--gray-600);
          background: var(--gray-100);
          padding: 4px 10px;
          border-radius: 6px;
        }

        .notification-time {
          font-size: 13px;
          color: var(--gray-500);
        }

        .notification-contact {
          font-size: 13px;
          color: var(--gray-600);
        }

        .notification-status {
          flex-shrink: 0;
        }

        @media (max-width: 768px) {
          .officer-notification-item {
            flex-direction: column;
            gap: 12px;
          }

          .notification-icon {
            width: 36px;
            height: 36px;
          }

          .notification-details {
            flex-direction: column;
            gap: 4px;
          }
        }
      `}</style>
    </div>
  );
};

export default OfficerNotifications;