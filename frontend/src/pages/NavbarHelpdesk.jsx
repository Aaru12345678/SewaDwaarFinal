import React, { useState, useEffect, useCallback, useRef } from "react";
import { FiUser, FiBell, FiLogOut, FiX, FiCheck } from "react-icons/fi";
import { MdCheckCircle, MdPending, MdCancel } from "react-icons/md";
import "../css/HelpdeskNavbar.css";

const NavbarHelpdesk = ({ username, onLogout }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notificationRef = useRef(null);
  const helpdeskId = localStorage.getItem("helpdesk_id");
  const locationId = localStorage.getItem("helpdesk_location");

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/helpdesk/${helpdeskId}/notifications`
      );
      const data = await res.json();
      console(data,"data")
      if (data.success && data.notifications) {
        setNotifications(data.notifications);
        const unread = data.notifications.filter((n) => !n.is_read).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  }, [helpdeskId, locationId]);

  useEffect(() => {
    if (helpdeskId) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000); // Poll every 30 seconds
      return () => clearInterval(interval);
    }
  }, [fetchNotifications, helpdeskId]);

  // Close notifications panel on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [showNotifications]);

  const markAsRead = async (notificationId) => {
    try {
      await fetch(
        `http://localhost:5000/api/helpdesk/notification/${notificationId}/mark-read`,
        { method: "PUT" }
      );
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await fetch(
        `http://localhost:5000/api/helpdesk/notification/${notificationId}`,
        { method: "DELETE" }
      );
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "completed":
        return <MdCheckCircle className="notification-icon completed" />;
      case "pending":
        return <MdPending className="notification-icon pending" />;
      case "cancelled":
        return <MdCancel className="notification-icon cancelled" />;
      default:
        return <MdCheckCircle className="notification-icon" />;
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

  return (
    <header className="helpdesk-navbar">
      <div className="navbar-left">
        <div className="navbar-title">Helpdesk Portal</div>
      </div>
      <div className="navbar-right">
        {/* <div className="notification-container" ref={notificationRef}>
          <button
            className="navbar-icon-btn notification-btn"
            onClick={() => setShowNotifications(!showNotifications)}
            title="Notifications"
          >
            <FiBell size={28} />
            {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount}</span>
            )}
          </button>

          {showNotifications && (
            <div className="notification-panel">
              <div className="notification-header">
                <h3>Notifications</h3>
                <button
                  className="close-btn"
                  onClick={() => setShowNotifications(false)}
                >
                  <FiX size={20} />
                </button>
              </div>

              <div className="notification-list">
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`notification-item ${
                        !notification.is_read ? "unread" : ""
                      } ${notification.type}`}
                    >
                      <div className="notification-icon-wrapper">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="notification-content">
                        <p className="notification-message">
                          {notification.message}
                        </p>
                        <span className="notification-time">
                          {formatTime(notification.created_at)}
                        </span>
                      </div>
                      <div className="notification-actions">
                        {!notification.is_read && (
                          <button
                            className="action-btn mark-read"
                            onClick={() => markAsRead(notification.id)}
                            title="Mark as read"
                          >
                            <FiCheck size={16} />
                          </button>
                        )}
                        <button
                          className="action-btn delete-btn"
                          onClick={() => deleteNotification(notification.id)}
                          title="Delete"
                        >
                          <FiX size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="no-notifications">
                    <p>No notifications yet</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div> */}

        <div className="navbar-user">
          <FiUser size={24} />
          <span>{username || "Helpdesk User"}</span>
        </div>
        <button
          className="navbar-icon-btn logout-btn"
          onClick={onLogout}
          title="Logout"
        >
          <FiLogOut size={28} />
        </button>
      </div>
    </header>
  );
};

export default NavbarHelpdesk;
