import React, { useState, useEffect, useCallback } from "react";
import { insertServices } from "../services/api";
import "../css/AddServices.css";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import {
  FaBuilding,
  FaCalendarAlt,
  FaUsers,
  FaChartBar,
  FaUserCog,
} from "react-icons/fa";

import {
  getOrganization,
  getDepartment,
} from "../services/api";

const NAME_REGEX = /^[A-Za-z ]+$/;
const MARATHI_REGEX = /^[\u0900-\u097F\s]+$/;

export default function AddServices() {
  const navigate = useNavigate();

  const [organizations, setOrganizations] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [services, setServices] = useState([]);
  const [activeServiceIndex, setActiveServiceIndex] = useState(null);

  const [currentService, setCurrentService] = useState({
    organization_id: "",
    organization_name: "",
    department_id: "",
    department_name: "",
    service_name: "",
    service_name_ll: "",
  });

  const [errors, setErrors] = useState({
    organization_id: "",
    department_id: "",
    service_name: "",
    service_name_ll: "",
  });

  // 🔹 Logout
  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  // 🔹 Load organizations
  useEffect(() => {
    (async () => {
      try {
        const res = await getOrganization();
        setOrganizations(Array.isArray(res.data) ? res.data : []);
      } catch {
        Swal.fire("Error", "Failed to load organizations", "error");
      }
    })();
  }, []);

  // 🔹 Fetch departments by org
  const fetchDepartments = useCallback(async (orgId) => {
    if (!orgId) return setDepartments([]);
    const res = await getDepartment(orgId);
    setDepartments(Array.isArray(res.data) ? res.data : []);
  }, []);

  // 🔹 Save service locally
  const saveService = () => {
  let hasError = false;

  // Initialize errors object with all keys
  const newErrors = {
    organization_id: "",
    department_id: "",
    service_name: "",
    service_name_ll: "",
  };

  // ✅ Organization validation
  if (!currentService.organization_id) {
    newErrors.organization_id = "Organization is required";
    hasError = true;
  }

  // ✅ Department validation
  if (!currentService.department_id) {
    newErrors.department_id = "Department is required";
    hasError = true;
  }

  // ✅ English service name validation
  if (!currentService.service_name.trim()) {
    newErrors.service_name = "Service name is required";
    hasError = true;
  } else if (!NAME_REGEX.test(currentService.service_name)) {
    newErrors.service_name = "Only alphabets and spaces allowed";
    hasError = true;
  }

  // ✅ Marathi service name validation
  if (!currentService.service_name_ll.trim()) {
    newErrors.service_name_ll = "Only Marathi (देवनागरी) characters are allowed";
    hasError = true;
  } else if (!MARATHI_REGEX.test(currentService.service_name_ll)) {
    newErrors.service_name_ll = "Only Marathi (देवनागरी) characters are allowed";
    hasError = true;
  }

  setErrors(newErrors);

  // Stop if any validation error exists
  if (hasError) return;

  // Save / update service in local array
  const updated = [...services];
  if (activeServiceIndex !== null) {
    updated[activeServiceIndex] = currentService;
  } else {
    updated.push({
      ...currentService,
      service_name: currentService.service_name.trim(),
      service_name_ll: currentService.service_name_ll.trim(),
    });
  }

  setServices(updated);

  // Reset form
  setCurrentService({
    organization_id: "",
    organization_name: "",
    department_id: "",
    department_name: "",
    service_name: "",
    service_name_ll: "",
  });

  setActiveServiceIndex(null);
  // Reset errors completely
  setErrors({
    organization_id: "",
    department_id: "",
    service_name: "",
    service_name_ll: "",
  });
};


  const editService = (i) => {
    setCurrentService(services[i]);
    setActiveServiceIndex(i);
  };

  const deleteService = (i) => {
    setServices(services.filter((_, idx) => idx !== i));
  };

  // 🔹 Submit to backend
  const handleSubmit = async () => {
  if (services.length === 0) {
    Swal.fire("Validation Error", "Add at least one service", "warning");
    return;
  }

  try {
    const res = await insertServices(services);

    // ✅ STRICT success check
    if (res?.data?.success !== true) {
      Swal.fire({
        icon: "error",
        title: "Insert Failed",
        text: res?.data?.message || "Services were not saved",
        confirmButtonColor: "#c62828",
      });
      return;
    }

    Swal.fire({
      icon: "success",
      title: "Services Added",
      text: "Services inserted successfully",
      confirmButtonColor: "#1f4fa3",
    });

    setServices([]);
  } catch (err) {
    Swal.fire({
      icon: "error",
      title: "Server Error",
      text: err?.response?.data?.message || "Unable to insert services",
      confirmButtonColor: "#c62828",
    });
  }
};


  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2 className="logo">ADMINISTRATIVE</h2>
        <ul>
          <li><Link to="/admin/departments"><FaBuilding /> Departments & Officers</Link></li>
          <li><Link to="/admin/slot-config"><FaCalendarAlt /> Slot & Holiday Config</Link></li>
          <li><Link to="/admin/appointments"><FaUsers /> Appointments & Walk In Summary</Link></li>
          <li><Link to="/admin/analytics"><FaChartBar /> Analytics & Reports</Link></li>
          <li><Link to="/admin/user-roles"><FaUserCog /> User Roles & Access</Link></li>
        </ul>
      </aside>

      {/* Main */}
      <div className="main">
        <header className="topbar">
          <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
          <div className="top-actions">
            <span>👤 Admin Profile</span>
            <button className="logout-btn" onClick={handleLogout}>Logout</button>
          </div>
        </header>

        <div className="services-wrapper">
          <div className="services-card">
            <h2 className="title">Register Government Services</h2>

            {/* TABLE */}
            {services.length > 0 && (
              <table className="services-table">
                <thead>
                  <tr>
                    <th>Service</th>
                    <th>Department</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {services.map((srv, i) => (
                    <tr key={i}>
                      <td>{srv.service_name}</td>
                      <td>{srv.department_name}</td>
                      <td>
                        <button onClick={() => editService(i)}>Edit</button>
                        <button onClick={() => deleteService(i)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* FORM */}
            <form className="services-form">
              <label>Organization *</label>
              <select
                value={currentService.organization_id}
                onChange={async (e) => {
                  const val = e.target.value;
                  const org = organizations.find(o => o.organization_id === val);

                  setCurrentService({
                    ...currentService,
                    organization_id: val,
                    organization_name: org?.organization_name || "",
                    department_id: "",
                    department_name: "",
                  });

                  setErrors({ ...errors, organization_id: "" });
                  await fetchDepartments(val);
                }}
              >
                <option value="">— Select Organization —</option>
                {organizations.map(org => (
                  <option key={org.organization_id} value={org.organization_id}>
                    {org.organization_name}
                  </option>
                ))}
              </select>
              {errors.organization_id && <div className="field-error">{errors.organization_id}</div>}

              <label>Department *</label>
              <select
                value={currentService.department_id}
                onChange={(e) => {
                  const val = e.target.value;
                  const dep = departments.find(d => d.department_id === val);

                  setCurrentService({
                    ...currentService,
                    department_id: val,
                    department_name: dep?.department_name || "",
                  });

                  setErrors({ ...errors, department_id: "" });
                }}
              >
                <option value="">— Select Department —</option>
                {departments.map(dep => (
                  <option key={dep.department_id} value={dep.department_id}>
                    {dep.department_name}
                  </option>
                ))}
              </select>
              {errors.department_id && <div className="field-error">{errors.department_id}</div>}

              <label>Service Name *</label>
<input
  value={currentService.service_name}
  onChange={(e) => {
    const val = e.target.value;

    setCurrentService({
      ...currentService,
      service_name: val,
    });

    if (!val.trim()) {
      setErrors({ ...errors, service_name: "Service name is required" });
    } else if (!NAME_REGEX.test(val)) {
      setErrors({
        ...errors,
        service_name: "Only alphabets and spaces allowed",
      });
    } else {
      setErrors({ ...errors, service_name: "" });
    }
  }}
/>

{errors.service_name && (
  <div className="field-error">{errors.service_name}</div>
)}


              <label>Service Name (Local Language)</label>
<input
  value={currentService.service_name_ll}
  onChange={(e) => {
    const val = e.target.value;

    setCurrentService({
      ...currentService,
      service_name_ll: val,
    });

    if (!val.trim()) {
      setErrors({
        ...errors,
        service_name_ll: "Only Marathi (देवनागरी) characters are allowed",
      });
    } else if (!MARATHI_REGEX.test(val)) {
      setErrors({
        ...errors,
        service_name_ll: "Only Marathi (देवनागरी) characters are allowed",
      });
    } else {
      setErrors({ ...errors, service_name_ll: "" });
    }
  }}
/>

{errors.service_name_ll && (
  <div className="field-error">{errors.service_name_ll}</div>
)}


              <div className="btn-row">
                <button type="button" onClick={saveService}>Save Service</button>
              </div>
            </form>

            <div className="btn-row">
              <button type="button" className="submit-btn" onClick={handleSubmit}>
                Submit All
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
