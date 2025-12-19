import React, { useEffect, useState } from "react";
import "../css/department.css";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";

import { 
  getOrganization, 
  getStates, 
  insertDepartments 
} from "../services/api";

export default function AddDepartment() {
  const navigate = useNavigate();

  // Dynamic lists
  const [orgList, setOrgList] = useState([]);
  const [stateList, setStateList] = useState([]);

  // Department + Services
  const [departments, setDepartments] = useState([]);
  const [activeDeptIndex, setActiveDeptIndex] = useState(null);
  const [activeServiceIndex, setActiveServiceIndex] = useState(null);

  const [currentDept, setCurrentDept] = useState({
    department_name: "",
    department_name_ll: "",
    organization_id: "",
    state_code: "",
    is_active: true,
    services: [],
  });

  // 🟢 Fetch orgs and states
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [{ data: orgData }, { data: stateData }] = await Promise.all([
          getOrganization(),
          getStates()
        ]);

        setOrgList(orgData || []);
        setStateList(stateData || []);
      } catch (err) {
        console.error("Error fetching org/state data:", err);
        toast.error("Failed to load organization or state list");
      }
    };

    fetchData();
  }, []);

  // 🟢 Save Department locally
  const handleSaveDepartment = () => {
    if (!currentDept.department_name || !currentDept.organization_id || !currentDept.state_code) {
      toast.error("Please fill in all required fields");
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
      organization_id: "",
      state_code: "",
      is_active: true,
      services: [],
    });
    setActiveDeptIndex(null);
    setActiveServiceIndex(null);
  };

  // 🟢 Submit to backend (API wrapper)
  const handleSubmit = async () => {
    if (departments.length === 0) {
      toast.error("Add at least one department first.");
      return;
    }

    const orgId = departments[0].organization_id;
    const stateCode = departments[0].state_code;

    try {
      const res = await insertDepartments({
        organization_id: orgId,
        state_code: stateCode,
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
        toast.success("Departments and services added successfully!");
        navigate("/admin/departments");
      } else {
        toast.error("Error: " + res.data.message);
      }
    } catch (err) {
      console.error("Error submitting:", err);
      toast.error("Server error while submitting departments");
    }
  };

  // 🟢 Edit/Delete + Service handlers
  const handleEditDept = (i) => {
    setCurrentDept(departments[i]);
    setActiveDeptIndex(i);
  };

  const handleDeleteDept = (i) => {
    setDepartments(departments.filter((_, idx) => idx !== i));
  };

  const addService = () => {
    const updated = [...currentDept.services, { service_name: "", service_name_ll: "" }];
    setCurrentDept({ ...currentDept, services: updated });
    setActiveServiceIndex(updated.length - 1);
  };

  const updateServiceField = (i, key, value) => {
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

  const closeServiceForm = () => setActiveServiceIndex(null);

  // 🧱 UI
  return (
    <div className="center-wrapper">
    <div className="dept-wrapper">
      <div className="dept-card">
        <div className="dept-breadcrumb">Home › Add Entry › Department</div>
        <h2 className="dept-title">Register Government Department</h2>

        {/* Department List Table */}
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
        <form className="dept-form">
          <div className="section-label">Basic Information</div>

          <label>Department Name *</label>
          <input
            type="text"
            value={currentDept.department_name}
            onChange={(e) =>
              setCurrentDept({ ...currentDept, department_name: e.target.value })
            }
          />

          <label>Department Name (Local Language)</label>
          <input
            type="text"
            value={currentDept.department_name_ll}
            onChange={(e) =>
              setCurrentDept({ ...currentDept, department_name_ll: e.target.value })
            }
          />

          <div className="section-label">Association</div>

          <label>Organization *</label>
          <select
            value={currentDept.organization_id}
            onChange={(e) =>
              setCurrentDept({ ...currentDept, organization_id: e.target.value })
            }
          >
            <option value="">— Select —</option>
            {orgList.map((o) => (
              <option key={o.organization_id} value={o.organization_id}>
                {o.organization_name}
              </option>
            ))}
          </select>

          <label>State *</label>
          <select
            value={currentDept.state_code}
            onChange={(e) =>
              setCurrentDept({ ...currentDept, state_code: e.target.value })
            }
          >
            <option value="">— Select —</option>
            {stateList.map((s) => (
              <option key={s.state_code} value={s.state_code}>
                {s.state_name}
              </option>
            ))}
          </select>

          <div className="toggle-row">
            <label>Status</label>
            <label className="switch">
              <input
                type="checkbox"
                checked={currentDept.is_active}
                onChange={() =>
                  setCurrentDept({ ...currentDept, is_active: !currentDept.is_active })
                }
              />
              <span className="slider"></span>
            </label>
          </div>

          {/* Services Table */}
          <div className="section-label">Services</div>
          {currentDept.services.length === 0 && <p>No services added.</p>}

          <table className="dept-table">
            <thead>
              <tr>
                <th>Service</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {currentDept.services.map((srv, i) => (
                <tr key={i}>
                  <td>{srv.service_name || "Untitled"}</td>
                  <td>
                    <button type="button" onClick={() => setActiveServiceIndex(i)}>Edit</button>
                    <button type="button" onClick={() => removeService(i)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button type="button" onClick={addService}>+ Add Service</button>

          {activeServiceIndex !== null && (
            <div className="service-card">
              <h4>Edit Service #{activeServiceIndex + 1}</h4>

              <label>Service Name *</label>
              <input
                type="text"
                value={currentDept.services[activeServiceIndex].service_name}
                onChange={(e) =>
                  updateServiceField(activeServiceIndex, "service_name", e.target.value)
                }
              />

              <label>Service Name (Local Language)</label>
              <input
                type="text"
                value={currentDept.services[activeServiceIndex].service_name_ll}
                onChange={(e) =>
                  updateServiceField(activeServiceIndex, "service_name_ll", e.target.value)
                }
              />

              <button type="button" onClick={closeServiceForm}>Close</button>
            </div>
          )}

          <div className="button-row">
            <button type="button" onClick={handleSaveDepartment}>Save Department</button>
          </div>
        </form>

        <div className="button-row">
          <button type="button" className="submit-btn" onClick={handleSubmit}>
            Submit All
          </button>
        </div>
      </div>
    </div>
    </div>
  );
}