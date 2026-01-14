import React, { useState, useEffect, useRef } from "react";
import { FaBuilding, FaEdit, FaEye } from "react-icons/fa";
import "../css/departments.css";
import { useNavigate } from "react-router-dom";

import {
  fetchOrganizations,
  fetchDepartmentsByOrg,
  fetchServicesByDept,
  fetchOfficers,
} from "../services/api";

const Departments = () => {
  const [organizations, setOrganizations] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [services, setServices] = useState([]);
  const [officers, setOfficers] = useState([]);
const [showOrgModal, setShowOrgModal] = useState(false);
const [viewOrg, setViewOrg] = useState(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [selectedDept, setSelectedDept] = useState(null);
  const [loading, setLoading] = useState(true);
  const handleViewOrg = (org) => {
  setViewOrg(org);
  setShowOrgModal(true);
};


  const navigate = useNavigate();
  const firstTypeRef = useRef(null);

  // Helper to convert is_active to status string
  const getStatus = (val) => {
  if (val === true || val === 1 || ["true","t","1"].includes(String(val).toLowerCase().trim())) return "Active";
  if (val === false || val === 0 || ["false","f","0"].includes(String(val).toLowerCase().trim())) return "Inactive";
  return "Unknown";
};



  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // 1️⃣ Organizations
        const { data: orgRes } = await fetchOrganizations();

        const orgRows = Array.isArray(orgRes) ? orgRes : [orgRes];

const orgMapped = orgRows.map((o) => ({
  id: o.organization_id,
  name: o.organization_name,
  status: getStatus(o.is_active),
}));

setOrganizations(orgMapped);

        // 2️⃣ Departments & 3️⃣ Services
        let allDepartments = [];
        let allServices = [];

        const deptPromises = orgMapped.map((org) =>
          fetchDepartmentsByOrg(org.id)
        );
        const deptResults = await Promise.all(deptPromises);

        for (let i = 0; i < orgMapped.length; i++) {
          const org = orgMapped[i];
          const deptRes = deptResults[i];
          const deptRows = Array.isArray(deptRes.data)
            ? deptRes.data
            : deptRes.data?.data || [];

          const deptsForOrg = deptRows.map((d) => ({
            id: d.department_id ?? d.id,
            organizationId: org.id,
            name: d.department_name ?? d.name,
            status: getStatus(d.is_active),
          }));
          allDepartments.push(...deptsForOrg);

          const srvPromises = deptsForOrg.map((dept) =>
            fetchServicesByDept(org.id, dept.id)
          );
          

          const srvResults = await Promise.all(srvPromises);

          srvResults.forEach((srvRes, idx) => {
            const dept = deptsForOrg[idx];
            const srvRows = Array.isArray(srvRes.data)
              ? srvRes.data
              : srvRes.data?.data || [];
            console.log("Fetched services:", srvRows);
            const svcsForDept = srvRows.map((s) => ({
            id: s.service_id ?? s.id,
            organizationId: org.id,
            departmentId: dept.id,
            name: s.service_name ?? s.name,
            status: getStatus(s.is_active),
            }));
            allServices.push(...svcsForDept);
          });
        }

        setDepartments(allDepartments);
        setServices(allServices);

        // 4️⃣ Officers
        try {
          const { data: offRes } = await fetchOfficers();
          const offRows = Array.isArray(offRes) ? offRes : offRes?.data || [];

          const officersMapped = offRows.map((o) => ({
            id: o.officer_id ?? o.id,
            departmentId: o.department_id ?? o.departmentId ?? null,
            name: o.full_name ?? o.name,
            role: o.role ?? o.designation_name ?? "",
            email: o.email ?? o.email_id,
            status: getStatus(o.is_active),
          }));

          setOfficers(officersMapped);
        } catch (err) {
          console.error("Error loading officers (optional):", err);
        }
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // Lock body scroll when modal open
  useEffect(() => {
    if (showAddModal) {
      document.body.style.overflow = "hidden";
      setTimeout(() => firstTypeRef.current?.focus(), 50);
    } else {
      document.body.style.overflow = "";
    }
  }, [showAddModal]);

  const openType = (type) => {
    setShowAddModal(false);
    navigate(`/add/${type}`);
  };

  const handleAddType = () => {
    setShowAddModal(true);
  };

  const handleOrgClick = (org) => {
    setSelectedOrg(selectedOrg?.id === org.id ? null : org);
    setSelectedDept(null);
  };

  const handleDeptClick = (dept) => {
    setSelectedDept(selectedDept?.id === dept.id ? null : dept);
  };

  return (
    <div className="departments-page">
      {/* Header */}
      <div className="departments-header">
        <h1>
          <FaBuilding /> Organizations Dashboard
        </h1>
        <div>
          <button className="add-department" onClick={handleAddType}>
            Onboard Entity
          </button>
          <button
            className="add-officer"
            onClick={() => navigate("/register-officer")}
          >
            Add Officer
          </button>
        </div>
      </div>

      {loading ? (
        <p style={{ padding: "1rem" }}>Loading dashboard…</p>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="stats-cards">
            <div className="stats-card">
              <h2>{organizations.length}</h2>
              <p>Total Organizations</p>
            </div>
            <div className="stats-card">
              <h2>{departments.length}</h2>
              <p>Total Departments</p>
            </div>
            <div className="stats-card">
              <h2>{services.length}</h2>
              <p>Total Services</p>
            </div>
            <div className="stats-card">
              <h2>{officers.length}</h2>
              <p>Total Officers</p>
            </div>
          </div>

          {/* Organization Table */}
          <div className="table-container">
            <h2>Organization</h2>
            <table>
              <thead>
                <tr>
                  <th>Organization Name</th>
                  <th>No. of Departments</th>
                  <th>No. of Services</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {organizations.map((org) => (
                  <React.Fragment key={org.id}>
                    <tr>
                      <td
                        style={{ cursor: "pointer" }}
                        onClick={() => handleOrgClick(org)}
                      >
                        {org.name}
                      </td>
                      <td>
                        {departments.filter(
                          (d) => d.organizationId === org.id
                        ).length}
                      </td>
                      <td>
                        {services.filter(
                          (s) => s.organizationId === org.id
                        ).length}
                      </td>
                      <td>{org.status}</td>
                      <td className="actions">
                        <button
  className="view"
  onClick={() => handleViewOrg(org)}
  title="View"
>
  <FaEye color="blue" size={16} />
</button>

                        <button
                          className="edit"
                          onClick={() =>
                            navigate(`/edit-organization/${org.id}`)
                          }
                          title="Edit"
                        >
                          <FaEdit color="blue" size={16} />
                        </button>
                      </td>
                    </tr>

                    {/* Nested Department Table */}
                    {selectedOrg?.id === org.id && (
                      <tr>
                        <td colSpan={5}>
                          <div className="nested-table-container">
                            <table>
                              <thead>
                                <tr>
                                  <th>Department Name</th>
                                  <th>No. of Services</th>
                                  <th>Status</th>
                                  <th>Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {departments
                                  .filter((d) => d.organizationId === org.id)
                                  .map((dept) => (
                                    <React.Fragment key={dept.id}>
                                      <tr>
                                        <td
                                          style={{ cursor: "pointer" }}
                                          onClick={() => handleDeptClick(dept)}
                                        >
                                          {dept.name}
                                        </td>
                                        <td>
                                          {services.filter(
                                            (s) => s.departmentId === dept.id
                                          ).length}
                                        </td>
                                        <td>{dept.status}</td>
                                        <td className="actions">
                                          <button
                                            className="view"
                                            onClick={() =>
                                              navigate(
                                                `/department/${dept.id}`
                                              )
                                            }
                                            title="View"
                                          >
                                            <FaEye color="green" size={14} />
                                          </button>
                                          <button
                                            className="edit"
                                            onClick={() =>
                                              navigate(
                                                `/edit-department/${dept.id}`
                                              )
                                            }
                                            title="Edit"
                                          >
                                            <FaEdit color="green" size={14} />
                                          </button>
                                        </td>
                                      </tr>

                                      {/* Nested Services Table */}
                                      {selectedDept?.id === dept.id && (
                                        <tr>
                                          <td colSpan={4}>
                                            <div className="nested-table-container">
                                              <table>
                                                <thead>
                                                  <tr>
                                                    <th>Service Name</th>
                                                    <th>Status</th>
                                                    <th>Actions</th>
                                                  </tr>
                                                </thead>
                                                <tbody>
                                                  {services
                                                    .filter(
                                                      (s) =>
                                                        s.departmentId ===
                                                        dept.id
                                                    )
                                                    .map((service) => (
                                                      <tr key={service.id}>
                                                        <td>
                                                          {service.name}
                                                        </td>
                                                        <td>
                                                          {service.status}
                                                        </td>
                                                        <td className="actions">
                                                          <button
                                                            className="view"
                                                            onClick={() =>
                                                              navigate(
                                                                `/service/${service.id}`
                                                              )
                                                            }
                                                            title="View"
                                                          >
                                                            <FaEye
                                                              color="orange"
                                                              size={14}
                                                            />
                                                          </button>
                                                          <button
                                                            className="edit"
                                                            onClick={() =>
                                                              navigate(
                                                                `/edit-service/${service.id}`
                                                              )
                                                            }
                                                            title="Edit"
                                                          >
                                                            <FaEdit
                                                              color="orange"
                                                              size={14}
                                                            />
                                                          </button>
                                                        </td>
                                                      </tr>
                                                    ))}
                                                </tbody>
                                              </table>
                                            </div>
                                          </td>
                                        </tr>
                                      )}
                                    </React.Fragment>
                                  ))}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {/* Type Onboarding Modal */}
          {showAddModal && (
            <div className="role-modal" role="dialog" aria-modal="true">
              <div
                className="role-modal-content"
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="role-heading">Select Onboarding Type</h2>
                <div className="role-grid">
                  <button
                    ref={firstTypeRef}
                    className="role-btn"
                    onClick={() => openType("organization")}
                  >
                    Organization
                    <span className="role-desc">
                      Onboard new organization
                    </span>
                  </button>
                  <button
                    className="role-btn"
                    onClick={() => openType("department")}
                  >
                    Department
                    <span className="role-desc">Register new department</span>
                  </button>
                  <button
                    className="role-btn"
                    onClick={() => openType("services")}
                  >
                    Services
                    <span className="role-desc">Add government services</span>
                  </button>
                </div>
                <div className="role-actions">
                  <button
                    className="role-cancel"
                    onClick={() => setShowAddModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Officers Table */}
          <div className="table-container" style={{ marginTop: "2rem" }}>
            <h2>Officers</h2>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {officers.map((off) => (
                  <tr key={off.id}>
                    <td>{off.name}</td>
                    <td>{off.role}</td>
                    <td>{off.email}</td>
                    <td>{off.status}</td>
                    <td className="actions">
                      <button
                        className="edit"
                        onClick={() => navigate(`/edit-officer/${off.id}`)}
                        title="Edit"
                      >
                        <FaEdit color="purple" size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      {showOrgModal && viewOrg && (
  <div className="modal-overlay" onClick={() => setShowOrgModal(false)}>
    <div
      className="modal-content"
      onClick={(e) => e.stopPropagation()}
    >
      <h2>🏢 Organization Details</h2>

      <div className="modal-row">
        <strong>ID:</strong> {viewOrg.id}
      </div>

      <div className="modal-row">
        <strong>Name:</strong> {viewOrg.name}
      </div>

      <div className="modal-row">
        <strong>Status:</strong> {viewOrg.status}
      </div>

      <div className="modal-row">
        <strong>Total Departments:</strong>{" "}
        {departments.filter(d => d.organizationId === viewOrg.id).length}
      </div>

      <div className="modal-row">
        <strong>Total Services:</strong>{" "}
        {services.filter(s => s.organizationId === viewOrg.id).length}
      </div>

      <div className="modal-actions">
        <button
          className="btn-close"
          onClick={() => setShowOrgModal(false)}
        >
          Close
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
};

export default Departments;
