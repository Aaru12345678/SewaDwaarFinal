import React, { useState, useEffect, useCallback } from "react";
import { insertServices,updateMultipleServices } from "../services/api";
import "../css/AddServices.css";
import { Link, useNavigate ,useParams } from "react-router-dom";
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
  getServicesById
} from "../services/api";

const NAME_REGEX = /^[A-Za-z ]+$/;

export default function EditServices() {
  const navigate = useNavigate();
const { service_id } = useParams();
console.log(service_id)

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
    if (errors.service_name) {
  return;
}
    let hasError = false;
    const newErrors = { organization_id: "", department_id: "", service_name: "" };

    if (!currentService.organization_id) {
      newErrors.organization_id = "Organization is required";
      hasError = true;
    }

    if (!currentService.department_id) {
      newErrors.department_id = "Department is required";
      hasError = true;
    }

    if (!currentService.service_name.trim()) {
      newErrors.service_name = "Service name is required";
      hasError = true;
    } else if (!NAME_REGEX.test(currentService.service_name)) {
      newErrors.service_name = "Only alphabets and spaces allowed";
      hasError = true;
    }

    setErrors(newErrors);
    if (hasError) return;

    const updated = [...services];

    if (activeServiceIndex !== null) {
      updated[activeServiceIndex] = currentService;
    } else {
     updated.push({
  ...currentService,
  service_name: currentService.service_name.trim(),
});



    }

    setServices(updated);

    setCurrentService({
      organization_id: "",
      organization_name: "",
      department_id: "",
      department_name: "",
      service_name: "",
      service_name_ll: "",
    });

    setActiveServiceIndex(null);
    setErrors({ organization_id: "", department_id: "", service_name: "" });
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
    const payload = services.map(s => ({
      service_id: s.service_id,
      organization_id:currentService.organization_id,
      department_id:currentService.department_id,        // ✅ REQUIRED
      service_name: s.service_name,
      service_name_ll: s.service_name_ll,
      is_active: true
    }));

    const res = await updateMultipleServices(payload);

    if (res?.data?.success !== true) {
      Swal.fire(
        "Update Failed",
        res?.data?.message || "Services not updated",
        "error"
      );
      return;
    }

    Swal.fire(
      "Success",
      "Services updated successfully",
      "success"
    );

    navigate("/admin/departments");

  } catch (err) {
    Swal.fire(
      "Server Error",
      err?.response?.data?.message || "Unable to update services",
      "error"
    );
  }
};

useEffect(() => {
  if (!service_id) return;

 const fetchServiceById = async () => {
  try {
    const res = await getServicesById(service_id);

    const service =
      res?.data?.data ||
      res?.data?.result ||
      res?.data ||
      null;

    if (!service) return;

    // 🔹 Fetch departments first
    const depRes = await getDepartment(service.organization_id);
    const depList = Array.isArray(depRes.data) ? depRes.data : [];

    setDepartments(depList);

    const selectedDept = depList.find(
      d => d.department_id === service.department_id
    );

    setCurrentService({
      organization_id: service.organization_id,
      organization_name: "",
      department_id: service.department_id,
      department_name: selectedDept?.department_name || "", // ✅ FIX
      service_name: service.service_name,
      service_name_ll: service.service_name_ll || "",
      service_id: service.service_id, // ✅ IMPORTANT
    });

  } catch (error) {
    console.error("❌ Failed to fetch service:", error);
  }
};


  fetchServiceById();
}, [service_id]); // 👈 ONLY dependency needed


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
                disabled={true}
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
              {errors.organization_id && <div className="field-error" >{errors.organization_id}</div>}

              <label>Department *</label>
              <select
                value={currentService.department_id}
                disabled={true}
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
              {errors.service_name && <div className="field-error">{errors.service_name}</div>}

              <label>Service Name (Local Language)</label>
              <input
                value={currentService.service_name_ll}
                onChange={(e) =>
                  setCurrentService({ ...currentService, service_name_ll: e.target.value })
                }
              />

              <div className="btn-row">
                <button type="button" onClick={saveService}>Save Service</button>
              </div>
            </form>

            <div className="btn-row">
              <button type="button" className="submit-btn" onClick={handleSubmit}>
                Update All
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
