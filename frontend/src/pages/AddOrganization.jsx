import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../css/AddOrganization.css";
import { getStates } from "../services/api";

export default function AddOrganization() {
  const navigate = useNavigate();
  const [states, setStates] = useState([]);

  const [form, setForm] = useState({
    organization_name: "",
    organization_name_ll: "",
    state_code: "",
    is_active: true,
  });

  const [departments, setDepartments] = useState([]);

  // ✅ reusable dropdown renderer
  const renderOptions = (list, valueKey, labelKey) => {
    return list.map((item) => (
      <option key={item[valueKey]} value={item[valueKey]}>
        {item[labelKey]}
      </option>
    ));
  };

  // ✅ Fetch states through LOCATION CONTROLLER Service
  useEffect(() => {
    (async () => {
      try {
        const res = await getStates();
        setStates(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Failed to load states:", err);
      }
    })();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleToggle = () => {
    setForm({ ...form, is_active: !form.is_active });
  };

  // ======= Department Methods =======
  const addDepartment = () => {
    setDepartments([
      ...departments,
      {
        dept_name: "",
        dept_name_ll: "",
        services: [],
        isOpen: true,
      },
    ]);
  };

  const toggleDept = (index) => {
    const updated = [...departments];
    updated[index].isOpen = !updated[index].isOpen;
    setDepartments(updated);
  };

  const handleDeptChange = (index, field, value) => {
    const updated = [...departments];
    updated[index][field] = value;
    setDepartments(updated);
  };

  const removeDepartment = (index) => {
    const updated = [...departments];
    updated.splice(index, 1);
    setDepartments(updated);
  };

  // ======= Service Methods =======
  const addService = (deptIndex) => {
    const updated = [...departments];
    updated[deptIndex].services.push({
      name: "",
      name_ll: "",
      isOpen: true,
    });
    setDepartments(updated);
  };

  const toggleService = (deptIndex, servIndex) => {
    const updated = [...departments];
    updated[deptIndex].services[servIndex].isOpen =
      !updated[deptIndex].services[servIndex].isOpen;
    setDepartments(updated);
  };

  const handleServiceChange = (deptIndex, servIndex, field, value) => {
    const updated = [...departments];
    updated[deptIndex].services[servIndex][field] = value;
    setDepartments(updated);
  };

  const removeService = (deptIndex, servIndex) => {
    const updated = [...departments];
    updated[deptIndex].services.splice(servIndex, 1);
    setDepartments(updated);
  };

  // ======= Submit =======
  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      ...form,
      departments,
    };

    fetch("http://localhost:5000/api/organization", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then(() => navigate("/admin/departments"));
  };
  return (
    <div className="org-page">
      <div className="org-card">

        <h2 className="org-title">Register Government Organization</h2>
        <div className="org-breadcrumb">Home › Add Entry › Organization</div>

        <form onSubmit={handleSubmit}>
          <h3 className="org-section">Basic Information</h3>

          <label>Organization Name</label>
          <input
            type="text"
            name="organization_name"
            value={form.organization_name}
            onChange={handleChange}
            required
          />

          <label>Organization Name (Local Language)</label>
          <input
            type="text"
            name="organization_name_ll"
            value={form.organization_name_ll}
            onChange={handleChange}
          />

          <div className="org-row">
            <h3 className="org-section">Status</h3>
            <label className="switch">
              <input type="checkbox" checked={form.is_active} onChange={handleToggle} />
              <span className="slider"></span>
            </label>
          </div>

          <h3 className="org-section">Location</h3>

          <label>State</label>
          <select
            name="state_code"
            value={form.state_code}
            onChange={handleChange}
            required
          >
            <option value="">Select State</option>
            {renderOptions(states, "state_code", "state_name")}
          </select>

          {/* ============= Departments ============= */}

          <h3 className="org-section">Departments</h3>

          {departments.map((dept, index) => (
            <div className="dept-card" key={index}>

              <div className="dept-header">
                <strong>Department #{index + 1}</strong>

                <div>
                  <button
                    type="button"
                    className="collapse-btn"
                    onClick={() => toggleDept(index)}
                  >
                    {dept.isOpen ? "▲" : "▼"}
                  </button>

                  <button
                    type="button"
                    className="remove-btn"
                    onClick={() => removeDepartment(index)}
                  >
                    ✕
                  </button>
                </div>
              </div>

              {dept.isOpen && (
                <div className="dept-body">
                  <label>Department Name</label>
                  <input
                    type="text"
                    value={dept.dept_name}
                    onChange={(e) =>
                      handleDeptChange(index, "dept_name", e.target.value)
                    }
                    required
                  />

                  <label>Department Name (Local Language)</label>
                  <input
                    type="text"
                    value={dept.dept_name_ll}
                    onChange={(e) =>
                      handleDeptChange(index, "dept_name_ll", e.target.value)
                    }
                  />

                  {/* ============= Services ============= */}

                  <h4>Services</h4>

                  {dept.services.map((srv, si) => (
                    <div key={si} className="service-card">

                      <div className="service-header">
                        <strong>Service #{si + 1}</strong>

                        <div>
                          <button
                            type="button"
                            className="collapse-btn"
                            onClick={() => toggleService(index, si)}
                          >
                            {srv.isOpen ? "▲" : "▼"}
                          </button>

                          <button
                            type="button"
                            className="remove-btn"
                            onClick={() => removeService(index, si)}
                          >
                            ✕
                          </button>
                        </div>
                      </div>

                      {srv.isOpen && (
                        <div className="service-body">
                          <label>Service Name</label>
                          <input
                            type="text"
                            value={srv.name}
                            onChange={(e) =>
                              handleServiceChange(index, si, "name", e.target.value)
                            }
                            required
                          />

                          <label>Service Name (Local Language)</label>
                          <input
                            type="text"
                            value={srv.name_ll}
                            onChange={(e) =>
                              handleServiceChange(index, si, "name_ll", e.target.value)
                            }
                          />
                        </div>
                      )}
                    </div>
                  ))}

                  <button
                    type="button"
                    className="add-btn"
                    onClick={() => addService(index)}
                  >
                    + Add Service
                  </button>
                </div>
              )}
            </div>
          ))}

          <button type="button" className="add-btn" onClick={addDepartment}>
            + Add Department
          </button>

          {/* Submit Block */}
          <div className="org-actions">
            <button type="button" className="cancel" onClick={() => navigate(-1)}>
              Cancel
            </button>
            <button type="submit" className="submit">
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}