import React, { useState, useEffect, useRef } from "react";
import { Link,useNavigate } from "react-router-dom";
import { FaHome, FaCalendarAlt, FaHistory, FaBell, FaUserCircle,FaChartBar } from "react-icons/fa";
import "../css/VisitorNavbar.css";
import { toast } from "react-toastify";
import { getUnreadNotificationCount,markNotificationsAsRead} from "../services/api";
import { getOfficerDashboard } from "../services/api";
// import {
//   FaCalendarDay, 
//   FaClock, 
//   FaCheckCircle, 
//   FaWalking,
//   FaArrowRight,
//   FaUser,
//   FaBell,
//   FaSignOutAlt,
//   FaRedo,
//   FaCalendarCheck,
//   FaCheck,
//   FaTimes,
//   FaCalendarAlt,
//   FaSearch,
//   FaFilePdf,
//   FaFileExcel,
//   FaDownload,
//   FaEye,
//   FaPhone,
//   FaEnvelope,
//   FaClipboardList,
//   FaChartBar
// } from "react-icons/fa";


function OfficerNavbar({ fullName }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate=useNavigate();
     const username = localStorage.getItem("username"); 
  const [loading, setLoading] = useState(true);
   const [fullName2, setFullName] = useState("Officer");
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

  return (
    <nav className="navbar">
      <ul className="nav-links">
        <li><Link to="/dashboard"><FaHome /> Home</Link></li>
        {/* <li><Link to="/appointment-wizard"><FaCalendarAlt /> Appointments Booking</Link></li>
        <li><Link to="/appointments"><FaHistory /> Appointment History</Link></li> */}
        <li className="notification-icon">
  <Link to="/officer/notifications2" className="nav-icon-btn" title="Notifications">
              <FaBell />
              {stats.pending > 0 && <span className="badge">{stats.pending}</span>}
            </Link>
            </li>
            <Link to="/officer/reports" className="nav-icon-btn" title="Reports">
                        <FaChartBar />
                      </Link>
                      

      </ul>

      <div className="navbar-right">
        <div className="profile" onClick={() => setDropdownOpen(!dropdownOpen)}>
          <FaUserCircle className="profile-icon" />
          <span className="profile-name">{fullName || "Guest"}</span>
        </div>
        {dropdownOpen && (
          <div className="dropdown">
            <Link to="/officer/profile">My Profile</Link>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

export default OfficerNavbar;
