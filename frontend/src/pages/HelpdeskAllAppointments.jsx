import React, { useState, useEffect, useCallback } from "react";
import { FaCalendarAlt, FaSearch, FaChevronDown, FaChevronUp, FaUser, FaBuilding, FaClock, FaEye, FaPhone, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";
import "../css/HelpdeskAllAppointment.css";
const buildDepartmentHierarchy = (departments, appointments) => {
  const deptMap = {};

  departments.forEach(dept => {
    deptMap[dept.department_id] = {
      ...dept,
      officers: {}
    };
  });

  appointments.forEach(apt => {
    const deptId = apt.department_id;
    const officerId = apt.officer_id || "UNKNOWN";

    if (!deptMap[deptId]) return;

    if (!deptMap[deptId].officers[officerId]) {
      deptMap[deptId].officers[officerId] = {
        officer_id: officerId,
        officer_name: apt.officer_name,
        officer_designation: apt.officer_designation,
        appointments: []
      };
    }

    deptMap[deptId].officers[officerId].appointments.push(apt);
  });

  return Object.values(deptMap).map(dept => ({
    ...dept,
    officers: Object.values(dept.officers)
  }));
};

const calculateStatusSummary = (appointments = []) => {
  return appointments.reduce(
    (acc, apt) => {
      const status = apt.status;
      if (status) {
        acc[status] = (acc[status] || 0) + 1;
      }
      return acc;
    },
    {
      pending: 0,
      approved: 0,
      completed: 0,
      rejected: 0,
      rescheduled: 0
    }
  );
};


const HelpdeskAllAppointments = ({ onBack }) => {
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [departments, setDepartments] = useState([]);
  const [allAppointments, setAllAppointments] = useState([]);
  const [statusSummary, setStatusSummary] = useState({});
  const [expandedDepartments, setExpandedDepartments] = useState({});
  const [expandedOfficers, setExpandedOfficers] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [hoveredRow, setHoveredRow] = useState(null);

  const helpdeskId = localStorage.getItem("helpdesk_id");
  const locationId = localStorage.getItem("helpdesk_location");

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `http://localhost:5000/api/helpdesk/${helpdeskId}/appointments-by-department?date=${selectedDate} || ""}`
      );
      const data = await res.json();

      console.log("Appointments API Response:", data); // Debug log

      if (data.success) {
  const structuredData = buildDepartmentHierarchy(
    data.departments || [],
    data.appointments || []
  );

  setDepartments(structuredData);
  setAllAppointments(data.appointments || []);

  const summary = calculateStatusSummary(data.appointments || []);
  setStatusSummary(summary);

  const expanded = {};
  data.departments?.forEach(dept => {
    expanded[dept.department_id] = true;
  });
  setExpandedDepartments(expanded);
}
 else {
        console.error("Invalid response structure:", data);
        setDepartments([]);
        setAllAppointments([]);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
      setDepartments([]);
      setAllAppointments([]);
    } finally {
      setLoading(false);
    }
  }, [helpdeskId, locationId, selectedDate]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const toggleDepartment = (deptId) => {
    setExpandedDepartments(prev => ({
      ...prev,
      [deptId]: !prev[deptId]
    }));
  };

  const toggleOfficer = (officerId) => {
    setExpandedOfficers(prev => ({
      ...prev,
      [officerId]: !prev[officerId]
    }));
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "#f59e0b",
      approved: "#10b981",
      completed: "#06b6d4",
      rejected: "#ef4444",
      rescheduled: "#8b5cf6"
    };
    return colors[status] || "#64748b";
  };

  const getStatusBgColor = (status) => {
    const colors = {
      pending: "#fef3c7",
      approved: "#d1fae5",
      completed: "#cffafe",
      rejected: "#fee2e2",
      rescheduled: "#ede9fe"
    };
    return colors[status] || "#f1f5f9";
  };

  const formatTime = (time) => {
    if (!time) return "N/A";
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  };

  const handleViewAppointment = (apt) => {
    setSelectedAppointment(apt);
    setShowViewModal(true);
  };

  // Filter appointments based on search and status
  const filterAppointments = (appointments) => {
    return appointments.filter(apt => {
      const matchesSearch = searchTerm === "" || 
        apt.visitor_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.appointment_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apt.service_name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || apt.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  };

  // Filter departments based on filtered appointments
  const getFilteredDepartments = () => {
    return departments.map(dept => {
      const officers = Array.isArray(dept.officers) ? dept.officers : [];
      const filteredOfficers = officers.map(officer => {
        const appointments = Array.isArray(officer.appointments) ? officer.appointments : [];
        const filteredApts = filterAppointments(appointments);
        return { ...officer, appointments: filteredApts };
      }).filter(officer => officer.appointments.length > 0);

      return {
        ...dept,
        officers: filteredOfficers,
        appointment_count: filteredOfficers.reduce((sum, o) => sum + o.appointments.length, 0)
      };
    }).filter(dept => dept.appointment_count > 0);
  };

  if (loading) {
    return (
      <div className="hd-apt-loading">
        <div className="spinner"></div>
        <p>Loading appointments...</p>
      </div>
    );
  }

  const filteredDepartments = getFilteredDepartments();
  const totalFiltered = filteredDepartments.reduce((sum, d) => sum + d.appointment_count, 0);

  return (
    <div className="hd-all-appointments">
      {/* Header */}
      <div className="hd-apt-header">
        <div className="hd-apt-title">
          <button className="hd-back-btn" onClick={onBack}>← Back</button>
          <h2>📋 All Appointments by Department</h2>
          <p className="hd-apt-subtitle">View-only access to all appointment statuses</p>
        </div>
      </div>

      {/* Date Picker & Filters */}
      <div className="hd-apt-filters">
        <div className="hd-filter-group">
          <label><FaCalendarAlt /> Select Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="hd-date-picker"
          />
        </div>

        <div className="hd-filter-group">
          <label><FaSearch /> Search</label>
          <input
            type="text"
            placeholder="Search by name, ID, service..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="hd-search-input"
          />
        </div>

        <div className="hd-filter-group">
          <label>Status Filter</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="hd-status-filter"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="completed">Completed</option>
            <option value="rejected">Rejected</option>
            <option value="rescheduled">Rescheduled</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="hd-apt-summary">
        <div className="hd-summary-card total">
          <span className="hd-summary-count">{totalFiltered}</span>
          <span className="hd-summary-label">Total</span>
        </div>
        <div className="hd-summary-card pending">
          <span className="hd-summary-count">{statusSummary.pending || 0}</span>
          <span className="hd-summary-label">Pending</span>
        </div>
        <div className="hd-summary-card approved">
          <span className="hd-summary-count">{statusSummary.approved || 0}</span>
          <span className="hd-summary-label">Approved</span>
        </div>
        <div className="hd-summary-card completed">
          <span className="hd-summary-count">{statusSummary.completed || 0}</span>
          <span className="hd-summary-label">Completed</span>
        </div>
        <div className="hd-summary-card rejected">
          <span className="hd-summary-count">{statusSummary.rejected || 0}</span>
          <span className="hd-summary-label">Rejected</span>
        </div>
        <div className="hd-summary-card rescheduled">
          <span className="hd-summary-count">{statusSummary.rescheduled || 0}</span>
          <span className="hd-summary-label">Rescheduled</span>
        </div>
      </div>

      {/* Departments Accordion */}
      <div className="hd-departments-container">
        {filteredDepartments.length === 0 ? (
          <div className="hd-no-data">
            <p>📭 No appointments found for {formatDate(selectedDate)}</p>
          </div>
        ) : (
          filteredDepartments.map((dept) => (
            <div key={dept.department_id} className="hd-department-card">
              {/* Department Header */}
              <div 
                className="hd-dept-header"
                onClick={() => toggleDepartment(dept.department_id)}
              >
                <div className="hd-dept-info">
                  <FaBuilding className="hd-dept-icon" />
                  <div>
                    <h3>{dept.department_name}</h3>
                    <span className="hd-org-name">{dept.organization_name}</span>
                  </div>
                </div>
                <div className="hd-dept-meta">
                  <span className="hd-apt-count">{dept.appointment_count} appointments</span>
                  {expandedDepartments[dept.department_id] ? <FaChevronUp /> : <FaChevronDown />}
                </div>
              </div>

              {/* Officers List */}
              {expandedDepartments[dept.department_id] && (
                <div className="hd-officers-list">
                  {Array.isArray(dept.officers) && dept.officers.map((officer) => {
                    const officerId = officer.officer_id || officer.user_id || `officer-${Math.random()}`;
                    return (
                    <div key={officerId} className="hd-officer-card">
                      {/* Officer Header */}
                      <div 
                        className="hd-officer-header"
                        onClick={() => toggleOfficer(officerId)}
                      >
                        <div className="hd-officer-info">
                          <FaUser className="hd-officer-icon" />
                          <div>
                            <h4>{officer.officer_name || officer.full_name || officer.name || "Unknown Officer"}</h4>
                            <span className="hd-officer-designation">{officer.officer_designation || officer.designation || "N/A"}</span>
                          </div>
                        </div>
                        <div className="hd-officer-meta">
                          <span className="hd-apt-badge">{(officer.appointments || []).length}</span>
                          {expandedOfficers[officerId] ? <FaChevronUp /> : <FaChevronDown />}
                        </div>
                      </div>

                      {/* Appointments Table */}
                      {expandedOfficers[officerId] && (
                        <div className="hd-appointments-table-wrapper">
                          <table className="hd-appointments-table">
                            <thead>
                              <tr>
                                <th>ID</th>
                                <th>Visitor</th>
                                <th>Service</th>
                                <th>Time</th>
                                <th>Status</th>
                                <th>View</th>
                              </tr>
                            </thead>
                            <tbody>
                              {(officer.appointments || []).map((apt) => (
                                <tr key={apt.appointment_id}>
                                  <td className="hd-apt-id">{apt.appointment_id}</td>
                                  <td>
                                    <div className="hd-visitor-cell">
                                      <span className="hd-visitor-name">{apt.visitor_name || "N/A"}</span>
                                      <span className="hd-visitor-phone">{apt.visitor_phone || ""}</span>
                                    </div>
                                  </td>
                                  <td>{apt.service_name || "N/A"}</td>
                                  <td>
                                    <div className="hd-time-cell">
                                      <FaClock />
                                      {formatTime(apt.slot_time)}
                                    </div>
                                  </td>
                                  <td>
                                    <span 
                                      className="hd-status-badge"
                                      style={{
                                        backgroundColor: getStatusBgColor(apt.status),
                                        color: getStatusColor(apt.status)
                                      }}
                                    >
                                      {apt.status}
                                    </span>
                                  </td>
                                  <td>
                                    <button 
                                      className="hd-view-btn"
                                      onClick={() => handleViewAppointment(apt)}
                                      title="View Details"
                                    >
                                      <FaEye />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  );
                  })}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* View Modal */}
      {showViewModal && selectedAppointment && (
        <div className="hd-modal-overlay" onClick={() => setShowViewModal(false)}>
          <div className="hd-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="hd-modal-header">
              <div className="hd-modal-title">
                <span className="hd-modal-status-badge" style={{
                  backgroundColor: getStatusBgColor(selectedAppointment.status),
                  color: getStatusColor(selectedAppointment.status)
                }}>
                  {selectedAppointment.status}
                </span>
                <h3>Appointment Details</h3>
              </div>
              <button className="hd-modal-close" onClick={() => setShowViewModal(false)}>✕</button>
            </div>
            <div className="hd-modal-body">
              <div className="hd-detail-grid">
                <div className="hd-detail-section appointment-info">
                  <div className="hd-section-header">
                    <h4>📋 Appointment Info</h4>
                  </div>
                  <div className="hd-detail-items">
                    <div className="hd-detail-item">
                      <span className="hd-detail-label">Appointment ID</span>
                      <span className="hd-detail-value mono">{selectedAppointment.appointment_id}</span>
                    </div>
                    <div className="hd-detail-item">
                      <span className="hd-detail-label">📅 Date</span>
                      <span className="hd-detail-value">{formatDate(selectedAppointment.appointment_date)}</span>
                    </div>
                    <div className="hd-detail-item">
                      <span className="hd-detail-label">🕐 Time</span>
                      <span className="hd-detail-value">{formatTime(selectedAppointment.slot_time)}</span>
                    </div>
                    <div className="hd-detail-item">
                      <span className="hd-detail-label">🏢 Service</span>
                      <span className="hd-detail-value">{selectedAppointment.service_name || "N/A"}</span>
                    </div>
                    {selectedAppointment.purpose && (
                      <div className="hd-detail-item">
                        <span className="hd-detail-label">📝 Purpose</span>
                        <span className="hd-detail-value">{selectedAppointment.purpose}</span>
                      </div>
                    )}
                    {selectedAppointment.reschedule_reason && (
                      <div className="hd-detail-item">
                        <span className="hd-detail-label">🔄 Reschedule Reason</span>
                        <span className="hd-detail-value">{selectedAppointment.reschedule_reason}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="hd-detail-section visitor-info">
                  <div className="hd-section-header">
                    <h4>👤 Visitor Information</h4>
                  </div>
                  <div className="hd-detail-items">
                    <div className="hd-detail-item">
                      <span className="hd-detail-label">Name</span>
                      <span className="hd-detail-value">{selectedAppointment.visitor_name || "N/A"}</span>
                    </div>
                    {selectedAppointment.visitor_phone && (
                      <div className="hd-detail-item">
                        <span className="hd-detail-label">
                          <FaPhone size={14} /> Phone
                        </span>
                        <a href={`tel:${selectedAppointment.visitor_phone}`} className="hd-detail-value link">
                          {selectedAppointment.visitor_phone}
                        </a>
                      </div>
                    )}
                    {selectedAppointment.visitor_email && (
                      <div className="hd-detail-item">
                        <span className="hd-detail-label">
                          <FaEnvelope size={14} /> Email
                        </span>
                        <a href={`mailto:${selectedAppointment.visitor_email}`} className="hd-detail-value link">
                          {selectedAppointment.visitor_email}
                        </a>
                      </div>
                    )}
                    {selectedAppointment.visitor_aadhar && (
                      <div className="hd-detail-item">
                        <span className="hd-detail-label">Aadhar</span>
                        <span className="hd-detail-value mono">{selectedAppointment.visitor_aadhar}</span>
                      </div>
                    )}
                    {selectedAppointment.visitor_address && (
                      <div className="hd-detail-item">
                        <span className="hd-detail-label">
                          <FaMapMarkerAlt size={14} /> Address
                        </span>
                        <span className="hd-detail-value">{selectedAppointment.visitor_address}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="hd-modal-footer">
                <p className="hd-modal-note">
                  ℹ️ <strong>View-Only Access:</strong> This is a read-only view. Appointment details cannot be modified from here.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HelpdeskAllAppointments;
