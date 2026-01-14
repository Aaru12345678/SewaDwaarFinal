import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NavbarHelpdesk from "../Components/NavbarHelpdesk";
import SidebarHelpdesk from "../Components/SidebarHelpdesk";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import { FiBell, FiArrowLeft, FiX, FiCheck, FiFilter } from "react-icons/fi";
import { MdCheckCircle, MdPending, MdCancel } from "react-icons/md";
import "../css/HelpdeskDashboard.css";

const HelpdeskNotifications = () => {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState("notifications");
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("all");
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  
  const helpdeskId = localStorage.getItem("helpdesk_id");
  const username = localStorage.getItem("helpdesk_username");
  const locationId = localStorage.getItem("helpdesk_location");

  // Fetch notifications
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `http://localhost:5000/api/helpdesk/${helpdeskId}/notifications?location_id=${locationId}`
      );
      const data = await res.json();
      
      if (data.success && data.notifications) {
        // Sort by most recent first
        const sorted = [...data.notifications].sort((a, b) => 
          new Date(b.created_at) - new Date(a.created_at)
        );
        setNotifications(sorted);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (helpdeskId) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [helpdeskId, locationId]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case "completed":
        return <MdCheckCircle className="notification-icon completed" />;
      case "pending":
        return <MdPending className="notification-icon pending" />;
      case "cancelled":
        return <MdCancel className="notification-icon cancelled" />;
      default:
        return <FiBell className="notification-icon" />;
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const markAsRead = async (notificationId) => {
    try {
      await fetch(
        `http://localhost:5000/api/helpdesk/notification/${notificationId}/mark-read`,
        { method: "PUT" }
      );
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      );
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await fetch(
        `http://localhost:5000/api/helpdesk/notification/${notificationId}`,
        { method: "DELETE" }
      );
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      setShowDetails(false);
      setSelectedNotification(null);
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await Promise.all(
        notifications
          .filter((n) => !n.is_read)
          .map((n) =>
            fetch(
              `http://localhost:5000/api/helpdesk/notification/${n.id}/mark-read`,
              { method: "PUT" }
            )
          )
      );
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, is_read: true }))
      );
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const deleteAllNotifications = async () => {
    if (!window.confirm("Are you sure you want to delete all notifications?")) {
      return;
    }
    
    try {
      await Promise.all(
        notifications.map((n) =>
          fetch(
            `http://localhost:5000/api/helpdesk/notification/${n.id}`,
            { method: "DELETE" }
          )
        )
      );
      setNotifications([]);
      setShowDetails(false);
      setSelectedNotification(null);
    } catch (error) {
      console.error("Error deleting all notifications:", error);
    }
  };

  const getFilteredNotifications = () => {
    if (filterType === "all") return notifications;
    if (filterType === "unread") return notifications.filter((n) => !n.is_read);
    return notifications.filter((n) => n.type === filterType);
  };

  const filteredNotifications = getFilteredNotifications();
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleLogout = () => {
    localStorage.removeItem("helpdesk_id");
    localStorage.removeItem("helpdesk_username");
    localStorage.removeItem("helpdesk_role");
    localStorage.removeItem("helpdesk_location");
    navigate("/login");
  };

  const handleMenuClick = (menu) => {
    setActiveMenu(menu);
    if (menu === "dashboard") {
      navigate("/helpdesk/dashboard");
    }
  };

  return (
    <div>
      <Header />
      <div className="helpdesk-layout">
        <SidebarHelpdesk activeMenu={activeMenu} onMenuClick={handleMenuClick} />

        <div className="helpdesk-main">
          <NavbarHelpdesk username={username} onLogout={handleLogout} />

          <div className="helpdesk-content">
            <div className="notifications-page">
              {/* Header */}
              <div className="notifications-header">
                <div className="header-content">
                  <button 
                    className="back-button"
                    onClick={() => navigate("/helpdesk/dashboard")}
                  >
                    <FiArrowLeft /> Back to Dashboard
                  </button>
                  <h1>🔔 Notifications</h1>
                  <p>Stay updated with all activities and alerts</p>
                </div>
                <div className="header-stats">
                  <div className="stat-box">
                    <span className="stat-number">{notifications.length}</span>
                    <span className="stat-label">Total</span>
                  </div>
                  <div className="stat-box unread">
                    <span className="stat-number">{unreadCount}</span>
                    <span className="stat-label">Unread</span>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="notifications-controls">
                <div className="filter-buttons">
                  <button
                    className={`filter-btn ${filterType === "all" ? "active" : ""}`}
                    onClick={() => setFilterType("all")}
                  >
                    All ({notifications.length})
                  </button>
                  <button
                    className={`filter-btn ${filterType === "unread" ? "active" : ""}`}
                    onClick={() => setFilterType("unread")}
                  >
                    Unread ({unreadCount})
                  </button>
                  <button
                    className={`filter-btn ${filterType === "completed" ? "active" : ""}`}
                    onClick={() => setFilterType("completed")}
                  >
                    Completed
                  </button>
                  <button
                    className={`filter-btn ${filterType === "pending" ? "active" : ""}`}
                    onClick={() => setFilterType("pending")}
                  >
                    Pending
                  </button>
                </div>

                {notifications.length > 0 && (
                  <div className="action-buttons">
                    {unreadCount > 0 && (
                      <button className="action-btn-small mark-all" onClick={markAllAsRead}>
                        <FiCheck /> Mark All Read
                      </button>
                    )}
                    <button className="action-btn-small delete-all" onClick={deleteAllNotifications}>
                      <FiX /> Delete All
                    </button>
                  </div>
                )}
              </div>

              {/* Main Content Area */}
              <div className="notifications-content">
                {loading ? (
                  <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading notifications...</p>
                  </div>
                ) : filteredNotifications.length === 0 ? (
                  <div className="empty-state">
                    <FiBell className="empty-icon" />
                    <h3>No notifications</h3>
                    <p>
                      {filterType === "all"
                        ? "You're all caught up!"
                        : `No ${filterType} notifications`}
                    </p>
                  </div>
                ) : (
                  <div className="notifications-list-container">
                    {/* Notifications List */}
                    <div className="notifications-list">
                      {filteredNotifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`notification-card ${
                            !notification.is_read ? "unread" : ""
                          } ${notification.type}`}
                        >
                          <div className="notification-card-icon">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="notification-card-content">
                            <p className="notification-card-message">
                              {notification.message}
                            </p>
                            <div className="notification-card-meta">
                              <span className="notification-card-time">
                                {formatTime(notification.created_at)}
                              </span>
                              <span className={`notification-card-type ${notification.type}`}>
                                {notification.type}
                              </span>
                            </div>
                          </div>
                          <div className="notification-card-actions">
                            {!notification.is_read && (
                              <button
                                className="card-action-btn read-btn"
                                onClick={() => markAsRead(notification.id)}
                                title="Mark as read"
                              >
                                <FiCheck />
                              </button>
                            )}
                            <button
                              className="card-action-btn details-btn"
                              onClick={() => {
                                setSelectedNotification(notification);
                                setShowDetails(true);
                              }}
                              title="View details"
                            >
                              →
                            </button>
                            <button
                              className="card-action-btn delete-btn"
                              onClick={() => deleteNotification(notification.id)}
                              title="Delete"
                            >
                              <FiX />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Notification Details Panel */}
                    {showDetails && selectedNotification && (
                      <div className="notification-details-panel">
                        <div className="details-header">
                          <h2>Notification Details</h2>
                          <button
                            className="close-details-btn"
                            onClick={() => setShowDetails(false)}
                          >
                            <FiX />
                          </button>
                        </div>
                        <div className="details-body">
                          {/* Icon and Type */}
                          <div className="details-section icon-section">
                            <div className="large-icon">
                              {getNotificationIcon(selectedNotification.type)}
                            </div>
                            <span className={`type-badge ${selectedNotification.type}`}>
                              {selectedNotification.type}
                            </span>
                          </div>

                          {/* Message */}
                          <div className="details-section">
                            <h3>Message</h3>
                            <p className="details-message">
                              {selectedNotification.message}
                            </p>
                          </div>

                          {/* Metadata */}
                          <div className="details-section">
                            <h3>Details</h3>
                            <div className="details-grid">
                              <div className="detail-item">
                                <span className="detail-label">Date & Time</span>
                                <span className="detail-value">
                                  {new Date(
                                    selectedNotification.created_at
                                  ).toLocaleString("en-IN", {
                                    dateStyle: "medium",
                                    timeStyle: "short",
                                  })}
                                </span>
                              </div>
                              <div className="detail-item">
                                <span className="detail-label">Status</span>
                                <span className="detail-value">
                                  {selectedNotification.is_read ? (
                                    <>
                                      <FiCheck className="read-icon" /> Read
                                    </>
                                  ) : (
                                    <>
                                      <div className="unread-indicator" /> Unread
                                    </>
                                  )}
                                </span>
                              </div>
                              <div className="detail-item">
                                <span className="detail-label">Category</span>
                                <span className="detail-value">
                                  {selectedNotification.type}
                                </span>
                              </div>
                              {selectedNotification.visitor_id && (
                                <div className="detail-item">
                                  <span className="detail-label">Visitor ID</span>
                                  <span className="detail-value">
                                    {selectedNotification.visitor_id}
                                  </span>
                                </div>
                              )}
                              {selectedNotification.appointment_id && (
                                <div className="detail-item">
                                  <span className="detail-label">Appointment ID</span>
                                  <span className="detail-value">
                                    {selectedNotification.appointment_id}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Additional Info */}
                          {selectedNotification.visitor_name && (
                            <div className="details-section">
                              <h3>Related Information</h3>
                              <div className="info-box">
                                <div className="info-item">
                                  <span className="info-label">Visitor</span>
                                  <span className="info-value">
                                    {selectedNotification.visitor_name}
                                  </span>
                                </div>
                                {selectedNotification.appointment_date && (
                                  <div className="info-item">
                                    <span className="info-label">Appointment Date</span>
                                    <span className="info-value">
                                      {new Date(
                                        selectedNotification.appointment_date
                                      ).toLocaleDateString("en-IN")}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Details Footer */}
                        <div className="details-footer">
                          {!selectedNotification.is_read && (
                            <button
                              className="detail-action-btn mark-read-btn"
                              onClick={() => {
                                markAsRead(selectedNotification.id);
                                setSelectedNotification((prev) => ({
                                  ...prev,
                                  is_read: true,
                                }));
                              }}
                            >
                              <FiCheck /> Mark as Read
                            </button>
                          )}
                          <button
                            className="detail-action-btn delete-btn"
                            onClick={() =>
                              deleteNotification(selectedNotification.id)
                            }
                          >
                            <FiX /> Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default HelpdeskNotifications;
