import React, { useEffect, useState } from "react";
import "../css/department.css";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { Link } from "react-router-dom";
import {
  FaBuilding,
  FaCalendarAlt,
  FaUsers,
  FaChartBar,
  FaUserCog,
} from "react-icons/fa";
import { 
  getOrganization, 
  insertDepartments 
} from "../services/api";

const NAME_REGEX = /^[A-Za-z\s]+$/;

export default function AddDepartment() {
  const navigate = useNavigate();

  // 🔹 Organization
  const [orgList, setOrgList] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState("");

  // 🔹 Departments
  const [departments, setDepartments] = useState([]);
  const [activeDeptIndex, setActiveDeptIndex] = useState(null);
  const [activeServiceIndex, setActiveServiceIndex] = useState(null);

  // 🔹 Form state
  const [currentDept, setCurrentDept] = useState({
    department_name: "",
    department_name_ll: "",
    services: [],
  });

  // 🔹 Inline errors
  const [deptError, setDeptError] = useState("");
  const [serviceError, setServiceError] = useState("");

   const handleLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user_id");
  localStorage.removeItem("officer_id");
  localStorage.removeItem("role_code");
  localStorage.removeItem("username");

  navigate("/login");
};

  // 🟢 Fetch organizations
  useEffect(() => {
    getOrganization()
      .then((res) => setOrgList(res.data || []))
      .catch(() =>
        Swal.fire("Error", "Failed to load organizations", "error")
      );
  }, []);

  // 🟢 Department name validation
  const handleDeptNameChange = (value) => {
    setCurrentDept({ ...currentDept, department_name: value });

    if (!value) {
      setDeptError("Department name is required");
    } else if (!NAME_REGEX.test(value)) {
      setDeptError("Only alphabets and spaces are allowed");
    } else {
      setDeptError("");
    }
  };

  // 🟢 Save department locally
  const handleSaveDepartment = () => {
    if (!selectedOrg) {
      Swal.fire("Validation Error", "Please select an organization", "warning");
      return;
    }

    if (!currentDept.department_name || deptError) {
      Swal.fire("Validation Error", "Please fix department name", "warning");
      return;
    }

    const updated = [...departments];

    if (activeDeptIndex !== null) updated[activeDeptIndex] = currentDept;
    else updated.push(currentDept);

    setDepartments(updated);
    resetForm();
  };

  const resetForm = () => {
    setCurrentDept({
      department_name: "",
      department_name_ll: "",
      services: [],
    });
    setDeptError("");
    setServiceError("");
    setActiveDeptIndex(null);
    setActiveServiceIndex(null);
  };

  // 🟢 Submit to backend
  const handleSubmit = async () => {
    if (departments.length === 0) {
      Swal.fire("Validation Error", "Add at least one department", "warning");
      return;
    }

    try {
      const res = await insertDepartments({
        organization_id: selectedOrg,
        departments: departments.map((d) => ({
          dept_name: d.department_name,
          dept_name_ll: d.department_name_ll,
          services: d.services.map((s) => ({
            name: s.service_name,
            name_ll: s.service_name_ll,
          })),
        })),
      });

      if (res.data.success) {
        Swal.fire("Success", "Departments added successfully", "success");
        navigate("/admin/departments");
      } else {
        Swal.fire("Error", res.data.message || "Submission failed", "error");
      }
    } catch (err) {
      Swal.fire("Server Error", "Unable to submit data", "error");
    }
  };

  // 🟢 Edit/Delete department
  const handleEditDept = (i) => {
    setCurrentDept(departments[i]);
    setActiveDeptIndex(i);
  };

  const handleDeleteDept = (i) => {
    setDepartments(departments.filter((_, idx) => idx !== i));
  };

  // 🟢 Services
  const addService = () => {
    setCurrentDept({
      ...currentDept,
      services: [...currentDept.services, { service_name: "", service_name_ll: "" }],
    });
    setActiveServiceIndex(currentDept.services.length);
  };

  const updateServiceField = (i, key, value) => {
    if (key === "service_name") {
      if (!NAME_REGEX.test(value) && value !== "") {
        setServiceError("Only alphabets and spaces allowed");
        return;
      } else {
        setServiceError("");
      }
    }

    const updated = [...currentDept.services];
    updated[i][key] = value;
    setCurrentDept({ ...currentDept, services: updated });
  };

  const removeService = (i) => {
    const updated = [...currentDept.services];
    updated.splice(i, 1);
    setCurrentDept({ ...currentDept, services: updated });
    setActiveServiceIndex(null);
  };

  return (
  <div className="admin-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2 className="logo">ADMINISTRATIVE</h2>
        <ul>
          <li>
            <Link to="/admin/departments">
              <FaBuilding /> Departments & Officers
            </Link>
          </li>
          <li>
            <Link to="/admin/slot-config">
              <FaCalendarAlt /> Slot & Holiday Config
            </Link>
          </li>
          <li>
            <Link to="/admin/appointments">
              <FaUsers /> Appointments & Walk In Summary
            </Link>
          </li>
          <li>
            <Link to="/admin/analytics">
              <FaChartBar /> Analytics & Reports
            </Link>
          </li>
          <li>
            <Link to="/admin/user-roles">
              <FaUserCog /> User Roles & Access
            </Link>
          </li>
        </ul>
      </aside>
  
      {/* Main Content */}
      <div className="main">
          {/* Top Header */}
          <header className="topbar">
            <button
      className="back-btn"
      onClick={() => navigate(-1)}
    >
      ← Back
    </button>
            <div className="top-actions">
              <span>👤 Admin Profile</span>
              {/* ✅ Clickable Logout Button */}
              <button className="logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </header>
  
    <div className="center-wrapper">
      <div className="dept-wrapper">
        <div className="dept-card">

          <h2 className="dept-title">Register Government Department</h2>

          {/* 🔹 Organization */}
          <label>Organization *</label>
          <select
            value={selectedOrg}
            onChange={(e) => setSelectedOrg(e.target.value)}
          >
            <option value="">— Select Organization —</option>
            {orgList.map((o) => (
              <option key={o.organization_id} value={o.organization_id}>
                {o.organization_name}
              </option>
            ))}
          </select>

          {/* Department List */}
          {departments.length > 0 && (
            <table className="dept-table">
              <thead>
                <tr>
                  <th>Department</th>
                  <th>Services</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {departments.map((d, i) => (
                  <tr key={i}>
                    <td>{d.department_name}</td>
                    <td>{d.services.length}</td>
                    <td>
                      <button onClick={() => handleEditDept(i)}>Edit</button>
                      <button onClick={() => handleDeleteDept(i)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Department Form */}
          <label>Department Name *</label>
          <input
            type="text"
            value={currentDept.department_name}
            onChange={(e) => handleDeptNameChange(e.target.value)}
          />
          {deptError && <div className="field-error">{deptError}</div>}

          <label>Department Name (Local Language)</label>
          <input
            type="text"
            value={currentDept.department_name_ll}
            onChange={(e) =>
              setCurrentDept({ ...currentDept, department_name_ll: e.target.value })
            }
          />

          {/* Services */}
          <div className="section-label">Services</div>

          <table className="dept-table">
            <tbody>
              {currentDept.services.map((srv, i) => (
                <tr key={i}>
                  <td>{srv.service_name || "Untitled"}</td>
                  <td>
                    <button onClick={() => setActiveServiceIndex(i)}>Edit</button>
                    <button onClick={() => removeService(i)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button onClick={addService}>+ Add Service</button>

          {activeServiceIndex !== null && (
            <div className="service-card">
              <label>Service Name *</label>
              <input
                type="text"
                value={currentDept.services[activeServiceIndex].service_name}
                onChange={(e) =>
                  updateServiceField(activeServiceIndex, "service_name", e.target.value)
                }
              />
              {serviceError && <div className="field-error">{serviceError}</div>}

              <label>Service Name (Local Language)</label>
              <input
                type="text"
                value={currentDept.services[activeServiceIndex].service_name_ll}
                onChange={(e) =>
                  updateServiceField(activeServiceIndex, "service_name_ll", e.target.value)
                }
              />
            </div>
          )}

          <div className="button-row">
            <button onClick={handleSaveDepartment}>Save Department</button>
            <button className="submit-btn" onClick={handleSubmit}>Submit All</button>
          </div>

        </div>
      </div>
    </div>
        </div>
    </div>
  );
}
