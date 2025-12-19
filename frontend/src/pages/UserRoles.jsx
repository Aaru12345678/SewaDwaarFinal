import React, { useState, useEffect } from "react";

import "../css/userRoles.css";
import { FaUsers } from "react-icons/fa";
import { getRolesSummary } from "../services/api";
// const sampleRoles = [
//   { role: "Super Admin", users: 2, permissions: "All Access" },
//   { role: "Admin", users: 5, permissions: "Limited Access" },
//   { role: "Viewer", users: 12, permissions: "Read Only" },
// ];



const sampleUsers = [
  { id: 1, name: "Alice", role: "Super Admin" },
  { id: 2, name: "Bob", role: "Super Admin" },
  { id: 3, name: "Charlie", role: "Admin" },
  { id: 4, name: "David", role: "Admin" },
  { id: 5, name: "Eve", role: "Admin" },
  { id: 6, name: "Frank", role: "Admin" },
  { id: 7, name: "Grace", role: "Admin" },
  { id: 8, name: "Hannah", role: "Viewer" },
  { id: 9, name: "Ian", role: "Viewer" },
  { id: 10, name: "Jack", role: "Viewer" },
  { id: 11, name: "Kate", role: "Viewer" },
  { id: 12, name: "Leo", role: "Viewer" },
  { id: 13, name: "Mia", role: "Viewer" },
  { id: 14, name: "Nina", role: "Viewer" },
];

const UserRoles = () => {
  const [roleFilter, setRoleFilter] = useState("All");
  const [viewRole, setViewRole] = useState(null);
  const [editRole, setEditRole] = useState(null);
  const [editRoleName, setEditRoleName] = useState("");
  const [editPermissions, setEditPermissions] = useState("");

  

  // View modal
  const handleView = (role) => setViewRole(role);
  const [roles, setRoles] = useState([]);
const [totalRoles, setTotalRoles] = useState(0);


  // Edit modal
  const handleEdit = (role) => {
    setEditRole(role);
    setEditRoleName(role.role);
    setEditPermissions(role.permissions);
  };

  // const handleSaveEdit = () => {
  //   const idx = sampleRoles.findIndex((r) => r.role === editRole.role);
  //   if (idx > -1) {
  //     sampleRoles[idx].role = editRoleName;
  //     sampleRoles[idx].permissions = editPermissions;
  //   }
  //   setEditRole(null);
  // };

  
const fetchRoles = async () => {
  try {
    const res = await getRolesSummary();
    if (res.data.success) {
      setRoles(res.data.data.roles);
      setTotalRoles(res.data.data.total_roles);
    }
  } catch (error) {
    console.error("Failed to fetch roles", error);
  }
};
useEffect(() => {
  fetchRoles();
}, []);
console.log(fetchRoles)
const filteredRoles =
  roleFilter === "All"
    ? roles
    : roles.filter((r) => r.role_name === roleFilter);


  return (
    <div className="user-roles-page">
      {/* Header */}
      <div className="header">
        <h1><FaUsers /> User Roles & Access</h1>
      </div>

      {/* Dashboard */}
      <div className="dashboard">
        {/* Filters */}
        <div className="filters">
          <label>
            Role:
            <select
  value={roleFilter}
  onChange={(e) => setRoleFilter(e.target.value)}
>
  <option value="All">All</option>
  {roles.map((r) => (
    <option key={r.role_code} value={r.role_name}>
      {r.role_name}
    </option>
  ))}
</select>
          </label>
        </div>

        {/* Cards */}
        {/* <div className="cards">
          <div className="card">Total Roles: {filteredRoles.length}</div>
          <div className="card">
            Total Users: {filteredRoles.reduce((acc, r) => acc + r.users, 0)}
          </div>
        </div> */}

        {/* Roles Table */}
        <div className="chart roles-table">
          <h3>User Roles & Access</h3>
          <table>
            <thead>
              <tr>
                <th>Role</th>
                <th>Users</th>
                <th>Permissions</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
  {filteredRoles.map((r) => (
    <tr key={r.role_code}>
      <td>{r.role_name}</td>
      <td>{r.role_name_ll}</td>
      <td>{r.is_active ? "Active" : "Inactive"}</td>
      <td>
        <button
          className="btn btn-view"
          onClick={() => handleView(r.role_name)}
        >
          View
        </button>
        <button
          className="btn btn-edit"
          onClick={() => handleEdit(r)}
        >
          Edit
        </button>
        <button className="btn btn-delete">Delete</button>
      </td>
    </tr>
  ))}
</tbody>

          </table>
        </div>

        {/* View Modal */}
        {viewRole && (
          <div className="modal-bg" onClick={() => setViewRole(null)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <h3>Users in {viewRole}</h3>
              <ul>
                {sampleUsers
                  .filter((u) => u.role === viewRole)
                  .map((u) => (
                    <li key={u.id}>{u.name}</li>
                  ))}
              </ul>
              <div className="modal-buttons">
                <button className="btn btn-view" onClick={() => setViewRole(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {editRole && (
          <div className="modal-bg" onClick={() => setEditRole(null)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <h3>Edit Role: {editRole.role}</h3>
              <input
                type="text"
                value={editRoleName}
                onChange={(e) => setEditRoleName(e.target.value)}
                placeholder="Role Name"
              />
              <input
                type="text"
                value={editPermissions}
                onChange={(e) => setEditPermissions(e.target.value)}
                placeholder="Permissions"
              />
              <div className="modal-buttons">
                {/* <button className="btn btn-edit" onClick={handleSaveEdit}>
                  Save
                </button> */}
                <button className="btn btn-view" onClick={() => setEditRole(null)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserRoles;
