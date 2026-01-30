import React, { useState, useEffect, useCallback } from "react";
import {
  FaCalendarAlt,
  FaSearch,
  FaChevronDown,
  FaChevronUp,
  FaUser,
  FaBuilding,
  FaClock,
  FaEye,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
} from "react-icons/fa";
import "../css/HelpdeskAllAppointment.css";
import Header from "../Components/Header";
import NavbarHelpdesk from "../pages/NavbarHelpdesk";
import SidebarHelpdesk from "../pages/SidebarHelpdesk";
import { useNavigate } from "react-router-dom";
import HelpdeskBooking from "../pages/HelpdeskBooking";
import AppointmentList from "../pages/AppointmentHelpdesk";

/* ================= HELPERS ================= */

const buildDepartmentHierarchy = (departments, appointments) => {
  const deptMap = {};

  departments.forEach((dept) => {
    deptMap[dept.department_id] = {
      ...dept,
      officers: {},
    };
  });

  appointments.forEach((apt) => {
    const deptId = apt.department_id;
    if (!deptId || !deptMap[deptId]) return;

    const officerId = apt.officer_id || "UNASSIGNED";

    if (!deptMap[deptId].officers[officerId]) {
      deptMap[deptId].officers[officerId] = {
        officer_id: officerId,
        officer_name: apt.officer_name || "Not Assigned",
        officer_designation: apt.officer_designation || "—",
        appointments: [],
      };
    }

    deptMap[deptId].officers[officerId].appointments.push(apt);
  });

  return Object.values(deptMap).map((dept) => ({
    ...dept,
    officers: Object.values(dept.officers),
  }));
};

const calculateStatusSummary = (appointments = []) => {
  return appointments.reduce(
    (acc, apt) => {
      const status = apt.status;

      if (status) {
        acc[status] = (acc[status] || 0) + 1;
      }

      /* 🔴 CHANGE KEY HERE IF BACKEND DIFFERS */
      if (apt.is_walkin === true) {
        acc.walkins += 1;
        if (status === "completed") {
          acc.walkins_completed += 1;
        }
      }

      return acc;
    },
    {
      pending: 0,
      approved: 0,
      completed: 0,
      rejected: 0,
      rescheduled: 0,
      walkins: 0,
      walkins_completed: 0,
    }
  );
};

/* ================= COMPONENT ================= */

const HelpdeskAllAppointments = () => {
  const [loading, setLoading] = useState(true);
  // const [selectedDate, setSelectedDate] = useState(
  //   new Date().toISOString().split("T")[0]
  // );
  const [departments, setDepartments] = useState([]);
  const [allAppointments, setAllAppointments] = useState([]);
  const [statusSummary, setStatusSummary] = useState({});
  const [expandedDepartments, setExpandedDepartments] = useState({});
  const [expandedOfficers, setExpandedOfficers] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showBooking, setShowBooking] = useState(false);
const [activeMenu, setActiveMenu] = useState("dashboard");
  const [showSearchUser, setShowSearchUser] = useState(false);
const [showAllAppointments, setShowAllAppointments] = useState(false);
  const [filterType, setFilterType] = useState("");
  const [showAppointmentList, setShowAppointmentList] = useState(false);
  const helpdeskId = localStorage.getItem("helpdesk_id");
  const username = localStorage.getItem("username");
    const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
const [photoSrc, setPhotoSrc] = useState("");
const [photoName, setPhotoName] = useState("");

  const navigate = useNavigate();
  const getFirstDayOfMonth = () => {
  const d = new Date();
  d.setDate(1); // set first day
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getToday = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const [fromDate, setFromDate] = useState(getFirstDayOfMonth());
const [toDate, setToDate] = useState(getToday());


  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(
  `http://localhost:5000/api/helpdesk/appointments-by-department?helpdesk_id=${username}&from_date=${fromDate}&to_date=${toDate}`
);
      const data = await res.json();
      console.log(data,"data")
      if (data.success) {
        const structured = buildDepartmentHierarchy(
          data.departments || [],
          data.appointments || []
        );

        setDepartments(structured);
        setAllAppointments(data.appointments || []);
        setStatusSummary(calculateStatusSummary(data.appointments || []));

        const expanded = {};
        data.departments?.forEach((d) => {
          expanded[d.department_id] = true;
        });
        setExpandedDepartments(expanded);
      } else {
        setDepartments([]);
        setAllAppointments([]);
      }
    } catch (err) {
      console.error(err);
      setDepartments([]);
      setAllAppointments([]);
    } finally {
      setLoading(false);
    }
  }, [username, fromDate,toDate]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  useEffect(() => {
  setShowAllAppointments(true);
}, []);


  const toggleDepartment = (id) =>
    setExpandedDepartments((p) => ({ ...p, [id]: !p[id] }));

  const toggleOfficer = (id) =>
    setExpandedOfficers((p) => ({ ...p, [id]: !p[id] }));

  // Check if officer name matches search
  const doesOfficerNameMatch = (officerName) => {
    if (!searchTerm) return false;
    return officerName?.toLowerCase().includes(searchTerm.toLowerCase());
  };

  // Filter appointments - but skip search filtering if officer name matches
  const filterAppointments = (apts, officerName) => {
    return apts.filter((a) => {
      // If officer name matches search, don't filter by search term
      // Only filter by status in this case
      if (doesOfficerNameMatch(officerName)) {
        const matchStatus = statusFilter === "all" || a.status === statusFilter;
        return matchStatus;
      }

      // Otherwise, filter by both search term and status
      const matchSearch =
        !searchTerm ||
        a.visitor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.appointment_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.service_name?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus = statusFilter === "all" || a.status === statusFilter;
      return matchSearch && matchStatus;
    });
  };

  const filteredDepartments = departments
    .map((dept) => {
      const officers = dept.officers
        .map((o) => {
          // Get filtered appointments (for display list)
          const filteredAppts = filterAppointments(o.appointments || [], o.officer_name);
          
          return {
            ...o,
            appointments: filteredAppts,
            // Store total count for badge (before filtering)
            totalAppointments: o.appointments?.length || 0,
          };
        })
        .filter((o) => {
          // Show officer if:
          // 1. They have filtered appointments OR
          // 2. Officer name matches search term
          const hasMatchingAppointments = o.appointments.length > 0;
          const officerNameMatches = doesOfficerNameMatch(o.officer_name);
          
          return hasMatchingAppointments || officerNameMatches;
        });

      return {
        ...dept,
        officers,
        // Use total appointments for count
        appointment_count: officers.reduce(
          (s, o) => s + o.totalAppointments,
          0
        ),
      };
    })
    .filter((d) => d.appointment_count > 0 || (searchTerm && d.officers.length > 0));

  const totalFiltered = filteredDepartments.reduce(
    (s, d) => s + d.appointment_count,
    0
  );

const handleBackToDashboard = () => {
    setShowAppointmentList(false);
    setShowBooking(false);
    setShowAllAppointments(false);
    setFilterType("");
    setActiveMenu("dashboard");
  };

const handleMenuClick = (menu) => {
  setActiveMenu(menu);

  setShowBooking(false);
  setShowAppointmentList(false);
  setShowSearchUser(false);

  if (menu === "booking") {
    setShowBooking(true);
    setShowAllAppointments(false);
  } 
  else if (menu === "all-appointments") {
    setShowAllAppointments(true);   // ✅ IMPORTANT
  } 
  else if (menu === "user") {
    setShowSearchUser(true);
    setShowAllAppointments(false);
  }
};

  if (loading) {
    return (
      <div className="hd-apt-loading">
        <div className="spinner" />
        <p>Loading appointments…</p>
      </div>
    );
  }

  return (
    <>
     <Header />
      <div className="helpdesk-layout">
        <SidebarHelpdesk activeMenu={activeMenu} onMenuClick={handleMenuClick} />

        <div className="helpdesk-main">
          <NavbarHelpdesk username={username} onLogout={handleLogout} />
<div className="helpdesk-content">
  {showBooking ? (
    <HelpdeskBooking onBack={handleBackToDashboard} />
  ) 
   : showAppointmentList ? (
    <AppointmentList
      filteredAppointments={filteredAppointments}
      handleBackToDashboard={handleBackToDashboard}
      filterType={filterType}
    />
  ) : (
    <div className="hd-all-appointments">
      {/* HEADER */}
      <div className="hd-apt-header">
        <h2>📋 All Appointments by Department</h2>
        <p className="hd-apt-subtitle">View-only access</p>
      </div>

      {/* FILTERS */}
      <div className="hd-apt-filters">
        <div className="hd-filter-group hd-date-range">
  <label>
    <FaCalendarAlt /> Date Range
  </label>

  <div className="hd-date-range-inputs">
    <input
      type="date"
      value={fromDate}
      max={toDate}
      onChange={(e) => setFromDate(e.target.value)}
      className="hd-date-picker"
    />

    <span className="hd-date-separator">to</span>

    <input
      type="date"
      value={toDate}
      min={fromDate}
      onChange={(e) => setToDate(e.target.value)}
      className="hd-date-picker"
    />
  </div>
</div>

{/* 
        <div className="hd-filter-group">
          <label>
            <FaSearch /> Search
          </label>
          <input
            type="text"
            className="hd-search-input"
            placeholder="Search…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="hd-filter-group">
          <label>Status</label>
          <select
            className="hd-status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="completed">Completed</option>
            <option value="rejected">Rejected</option>
            <option value="rescheduled">Rescheduled</option>
          </select>
        </div> */}
      </div>

      {/* SUMMARY */}
      <div className="hd-apt-summary">
  <div className="hd-summary-card total">
    <span className="hd-summary-count">{allAppointments.length}</span>
    <span className="hd-summary-label">Total</span>
  </div>

  <div className="hd-summary-card pending">
    <span className="hd-summary-count">{statusSummary.pending}</span>
    <span className="hd-summary-label">Pending</span>
  </div>

  <div className="hd-summary-card approved">
    <span className="hd-summary-count">{statusSummary.approved}</span>
    <span className="hd-summary-label">Approved</span>
  </div>

  <div className="hd-summary-card completed">
    <span className="hd-summary-count">{statusSummary.completed}</span>
    <span className="hd-summary-label">Completed</span>
  </div>

  <div className="hd-summary-card rejected">
    <span className="hd-summary-count">{statusSummary.rejected}</span>
    <span className="hd-summary-label">Rejected</span>
  </div>

  <div className="hd-summary-card rescheduled">
    <span className="hd-summary-count">{statusSummary.rescheduled}</span>
    <span className="hd-summary-label">Rescheduled</span>
  </div>

  <div className="hd-summary-card walkins">
    <span className="hd-summary-count">{statusSummary.walkins}</span>
    <span className="hd-summary-label">Walk-ins</span>
  </div>

  <div className="hd-summary-card walkins-completed">
    <span className="hd-summary-count">{statusSummary.walkins_completed}</span>
    <span className="hd-summary-label">Walk-ins Completed</span>
  </div>
</div>


{/* ================= DEPARTMENTS & APPOINTMENTS ================= */}
<div className="hd-departments-container">
  {departments.map((dept) => (
    <div key={dept.department_id} className="hd-department-card">
      
      {/* ================= DEPARTMENT HEADER ================= */}
      <div className="hd-dept-header">
        <div className="hd-dept-info">
          <FaBuilding />
          <div>
            <h3>{dept.department_name}</h3>
            <span className="hd-org-name">
              {dept.organization_name}
            </span>
          </div>
        </div>

        <div className="hd-dept-meta">
          <span className="hd-apt-count">
            {allAppointments.length}
          </span>
        </div>
      </div>

      {/* ================= APPOINTMENTS LIST ================= */}
      <div className="hd-appointments-list">
        {allAppointments.length > 0 ? (
          allAppointments.map((apt) => (
            <div
              key={apt.appointment_id}
              className={`hd-appointment-item ${apt.status}`}
              onClick={() => {
    setSelectedAppointment(apt);
    setShowViewModal(true);
  }}
            >
              <div className="hd-apt-visitor-info">
  {/* VISITOR PHOTO */}
  <div className="hd-apt-photo">
  <img
    src={
      apt.visitor_photo
        ? `http://localhost:5000/uploads/${apt.visitor_photo}`
        : "/images/default-avatar.png"
    }
    alt={apt.visitor_name}
    onClick={(e) => {
      e.stopPropagation(); // 🚫 prevent appointment modal
      setPhotoSrc(
        apt.visitor_photo
          ? `http://localhost:5000/uploads/${apt.visitor_photo}`
          : "/images/default-avatar.png"
      );
      setPhotoName(apt.visitor_name);
      setShowPhotoModal(true);
    }}
    onError={(e) => {
      e.target.src = "/images/default-avatar.png";
    }}
  />
</div>

  {/* VISITOR NAME & DETAILS */}
  <div className="hd-apt-info">
    <div className="hd-apt-name">{apt.visitor_name}</div>
     {/* OFFICER NAME */}
  <div className="hd-apt-officer">
    <FaUser /> {apt.officer_name || "Not Assigned"}
  </div>
    <div className="hd-apt-details">
      <span className="hd-apt-time">
        <FaClock /> {apt.slot_time}
      </span>
      <span className="hd-apt-service">{apt.service_name}</span>
    </div>
  </div>
</div>

              {/* STATUS */}
              <div className="hd-apt-status">
                <span className={`hd-status-badge ${apt.status}`}>
                  {apt.status.charAt(0).toUpperCase() +
                    apt.status.slice(1)}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="hd-no-appointments">
            <p>No appointments for selected date</p>
          </div>
        )}
      </div>
    </div>
  ))}
</div>

      
    </div>)}
    {showPhotoModal && (
  <div
    className="hd-photo-overlay"
    onClick={() => setShowPhotoModal(false)}
  >
    <div
      className="hd-photo-modal"
      onClick={(e) => e.stopPropagation()}
    >
      <img src={photoSrc} alt={photoName} />
      <p className="hd-photo-name">{photoName}</p>

      <button
        className="hd-photo-close"
        onClick={() => setShowPhotoModal(false)}
      >
        ✕
      </button>
    </div>
  </div>
)}

    {showViewModal && selectedAppointment && (
  <div className="hd-modal-overlay" onClick={() => setShowViewModal(false)}>
    <div
      className="hd-modal"
      onClick={(e) => e.stopPropagation()}
    >
      {/* HEADER */}
      <div className="hd-modal-header">
        <h3>Appointment Details</h3>
        <button
          className="hd-modal-close"
          onClick={() => setShowViewModal(false)}
        >
          ✕
        </button>
      </div>

      {/* BODY */}
      <div className="hd-modal-body">
        {/* VISITOR PHOTO */}
        <div className="hd-modal-photo">
          <img
            src={
              selectedAppointment.visitor_photo
                ? `http://localhost:5000/uploads/${selectedAppointment.visitor_photo}`
                : "/images/default-avatar.png"
            }
            alt={selectedAppointment.visitor_name}
            onError={(e) => {
              e.target.src = "/images/default-avatar.png";
            }}
          />
        </div>

        {/* DETAILS */}
        <div className="hd-modal-details">
          <p><strong>Name:</strong> {selectedAppointment.visitor_name}</p>
          <p><FaPhone /> {selectedAppointment.mobile_no || "—"}</p>
          <p><FaEnvelope /> {selectedAppointment.email_id || "—"}</p>
          <p>
  <FaUser /> {selectedAppointment.officer_name || "Not Assigned"}
</p>

          <p><FaClock /> {selectedAppointment.slot_time}</p>
          <p><strong>Service:</strong> {selectedAppointment.service_name}</p>
          <p><strong>Status:</strong> {selectedAppointment.status}</p>
          <p>
            <FaMapMarkerAlt />{" "}
            {selectedAppointment.department_name}
          </p>
        </div>
      </div>
    </div>
  </div>
)}

    </div>
    </div>
    </div>
    </>
  );
};

export default HelpdeskAllAppointments;