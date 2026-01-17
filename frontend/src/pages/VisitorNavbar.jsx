import React, { useState, useEffect, useRef } from "react";
import { Link,useNavigate } from "react-router-dom";
import { FaHome, FaCalendarAlt, FaHistory, FaBell, FaUserCircle } from "react-icons/fa";
import "../css/VisitorNavbar.css";
import { toast } from "react-toastify";
import { getUnreadNotificationCount,markNotificationsAsRead} from "../services/api";

function VisitorNavbar({ fullName }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate=useNavigate();
     const username = localStorage.getItem("username"); 


const [notificationCount, setNotificationCount] = useState(0);
const countRef = useRef(0);
const notificationSound = useRef(
  new Audio("/sounds/notification.wav")
);
const fetchCount = async () => {
  try {
    const response = await getUnreadNotificationCount(username);

    if (response?.data?.unreadCount !== undefined) {
      countRef.current = response.data.unreadCount;
      setNotificationCount(response.data.unreadCount);
    }
  } catch (err) {
    console.error("Failed to fetch notification count", err);
  }
};
useEffect(() => {
  const handleNewNotification = () => {
    countRef.current += 1;
    setNotificationCount(countRef.current);

    notificationSound.current.currentTime = 0;
    notificationSound.current.play().catch(() => {});
  };

  window.addEventListener("notification:new", handleNewNotification);

  return () => {
    window.removeEventListener("notification:new", handleNewNotification);
  };
}, []);

useEffect(() => {
  if (!username) return;

  fetchCount();
  const interval = setInterval(fetchCount, 10000);

  return () => clearInterval(interval);
}, [username]);

const handleNotificationClick = async () => {
  try {
    // 🔕 Reset UI immediately
    countRef.current = 0;
    setNotificationCount(0);

    // 🔄 Update DB
    await markNotificationsAsRead();
  } catch (err) {
    console.error("Failed to mark notifications as read", err);
  }
};


// useEffect(() => {
//   const handleNewNotification = (event) => {
//     setNotificationCount(prev => prev + 1);

//     // 🔔 Play sound
//     notificationSound.current.currentTime = 0;
//     notificationSound.current.play().catch(() => {});
//   };

//   window.addEventListener("notification:new", handleNewNotification);

//   return () => {
//     window.removeEventListener("notification:new", handleNewNotification);
//   };
// }, []);


const handleLogout = () => {
    // Clear all session/local storage data
    localStorage.removeItem("token");
    localStorage.removeItem("user_id");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    localStorage.removeItem("userstate_code");
    localStorage.removeItem("userdivision_code");
    localStorage.removeItem("userdistrict_code");
    localStorage.removeItem("usertaluka_code");

    // Redirect to login
   navigate('/logout');
  };
  useEffect(()=>{if (!username) {
      toast.error("Please log in first");
      navigate("/login");
      return;}},[username])
  
  return (
    <nav className="navbar">
      <ul className="nav-links">
        <li><Link to="/dashboard1"><FaHome /> Home</Link></li>
        <li><Link to="/appointment-wizard"><FaCalendarAlt /> Appointments Booking</Link></li>
        <li><Link to="/appointments"><FaHistory /> Appointment History</Link></li>
        <li className="notification-icon">
  <Link to="/notifications"  >
    <FaBell className={notificationCount > 0 ? "bell-active" : ""} onClick={handleNotificationClick}/>
    {/* {notificationCount > 0 && (
      <span className="notification-badge">
        {notificationCount}
      </span>
    )} */}
  </Link>
</li>

      </ul>

      <div className="navbar-right">
        <div className="profile" onClick={() => setDropdownOpen(!dropdownOpen)}>
          <FaUserCircle className="profile-icon" />
          <span className="profile-name">{fullName || "Guest"}</span>
        </div>
        {dropdownOpen && (
          <div className="dropdown">
            <Link to="/profile">My Profile</Link>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

export default VisitorNavbar;
