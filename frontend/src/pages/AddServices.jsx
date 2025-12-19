import React, { useState, useEffect, useCallback } from "react";
import { insertServices } from "../services/api";
import "../css/AddServices.css";

import {
  getStates,
  getOrganization,
  getDepartment,
} from "../services/api";

export default function AddServices() {
  const [states, setStates] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [services, setServices] = useState([]);
  const [activeServiceIndex, setActiveServiceIndex] = useState(null);

  const [currentService, setCurrentService] = useState({
    organization_id: "",
    organization_name: "",
    department_id: "",
    department_name: "",
    state_code: "",
    state_name: "",
    service_name: "",
    service_name_ll: "",
    is_active: true,
  });



  // Fetch initial dropdown data
  useEffect(() => {
    (async () => {
      try {
        const stateRes = await getStates();
        setStates(Array.isArray(stateRes.data) ? stateRes.data : []);

        const orgRes = await getOrganization();
        setOrganizations(Array.isArray(orgRes.data) ? orgRes.data : []);
      } catch (err) {
        console.log("Error loading dropdown data", err);
      }
    })();
  }, []);

  // Fetch departments by organization
  const fetchDepartments = useCallback(async (orgId) => {
    if (!orgId) return setDepartments([]);
    const res = await getDepartment(orgId);
    setDepartments(Array.isArray(res.data) ? res.data : []);
  }, []);

  const saveService = () => {
    if (!currentService.service_name)
      return alert("Service name is required!");

    const updated = [...services];

    if (activeServiceIndex !== null) {
      updated[activeServiceIndex] = currentService;
    } else {
      updated.push({ ...currentService});
    }

    setServices(updated);

    // reset form
    setCurrentService({
      organization_id: "",
      organization_name: "",
      department_id: "",
      department_name: "",
      state_code: "",
      state_name: "",
      service_name: "",
      service_name_ll: "",
      is_active: true,
    });

    setActiveServiceIndex(null);
  };

  const editService = (i) => {
    setCurrentService(services[i]);
    setActiveServiceIndex(i);
  };

  const deleteService = (i) => {
    const filtered = services.filter((_, index) => index !== i);
    setServices(filtered);
  };

  const handleSubmit = async () => {
  try {
    if (services.length === 0) {
      return alert("No services to submit!");
    }

    const res = await insertServices(services);

    alert("✅ Services inserted into database!");
    setServices([]);
  } catch (err) {
    console.error("Submit Error:", err);
    alert("❌ Failed to insert services");
  }
};

  return (
    <div className="services-wrapper">
      <div className="services-card">
        <div className="breadcrumb">Home › Add Entry › Services</div>
        <h2 className="title">Register Government Services</h2>

        {/* TABLE LIST */}
        {services.length > 0 && (
          <table className="services-table">
            <thead>
              <tr>
                <th>Service</th>
                <th>Department</th>
                <th>State</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {services.map((srv, i) => (
                <tr key={i}>
                  <td>{srv.service_name}</td>
                  <td>{srv.department_name}</td>
                  <td>{srv.state_name}</td>
                  <td>
                    <button onClick={() => editService(i)}>Edit</button>
                    <button onClick={() => deleteService(i)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* SERVICE FORM */}
        <form className="services-form">

          {/* Organization */}
          <label>Organization *</label>
          <select
            value={currentService.organization_id}
            onChange={async (e) => {
              const val = e.target.value;
              const org = organizations.find((o) => o.organization_id === val);

              setCurrentService({
                ...currentService,
                organization_id: val,
                organization_name: org?.organization_name || "",
                department_id: "",
                department_name: "",
              });

              await fetchDepartments(val);
            }}
          >
            <option value="">— Select Organization —</option>
            {organizations.map((org) => (
              <option key={org.organization_id} value={org.organization_id}>
                {org.organization_name}
              </option>
            ))}
          </select>

          {/* Department */}
          <label>Department *</label>
          <select
            value={currentService.department_id}
            onChange={(e) => {
              const val = e.target.value;
              const dep = departments.find((d) => d.department_id === val);

              setCurrentService({
                ...currentService,
                department_id: val,
                department_name: dep?.department_name || "",
              });
            }}
          >
            <option value="">— Select Department —</option>
            {departments.map((dep) => (
              <option key={dep.department_id} value={dep.department_id}>
                {dep.department_name}
              </option>
            ))}
          </select>

          {/* State */}
          <label>State *</label>
          <select
            value={currentService.state_code}
            onChange={(e) => {
              const val = e.target.value;
              const st = states.find((s) => s.state_code === val);
              setCurrentService({
                ...currentService,
                state_code: val,
                state_name: st?.state_name || "",
              });
            }}
          >
            <option value="">— Select State —</option>
            {states.map((st) => (
              <option key={st.state_code} value={st.state_code}>
                {st.state_name}
              </option>
            ))}
          </select>

          {/* Service Name */}
          <label>Service Name *</label>
          <input
            value={currentService.service_name}
            onChange={(e) =>
              setCurrentService({ ...currentService, service_name: e.target.value })
            }
          />

          {/* Service Name (Local Language) */}
          <label>Service Name (Local Language)</label>
          <input
            value={currentService.service_name_ll}
            onChange={(e) =>
              setCurrentService({ ...currentService, service_name_ll: e.target.value })
            }
          />

          {/* Active Toggle */}
          <div className="toggle-row">
            <label>Status</label>
            <label className="switch">
              <input
                type="checkbox"
                checked={currentService.is_active}
                onChange={() =>
                  setCurrentService({
                    ...currentService,
                    is_active: !currentService.is_active,
                  })
                }
              />
              <span className="slider"></span>
            </label>
          </div>

          <div className="btn-row">
            <button type="button" onClick={saveService} className="cancel-btn">
              Save Service
            </button>
          </div>
        </form>

        <div className="btn-row">
          <button type="button" onClick={handleSubmit} className="submit-btn">
            Submit All
          </button>
        </div>
      </div>
    </div>
  );
}
