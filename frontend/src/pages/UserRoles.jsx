import React, { useState } from "react";
import "../css/userRoles.css";

const sampleRoles = [
  { role: "Super Admin", users: 2, permissions: "All Access" },
  { role: "Admin", users: 5, permissions: "Limited Access" },
  { role: "Viewer", users: 12, permissions: "Read Only" },
];

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

  const filteredRoles =
    roleFilter === "All"
      ? sampleRoles
      : sampleRoles.filter((r) => r.role === roleFilter);

  // View modal
  const handleView = (role) => setViewRole(role);

  // Edit modal
  const handleEdit = (role) => {
    setEditRole(role);
    setEditRoleName(role.role);
    setEditPermissions(role.permissions);
  };

  const handleSaveEdit = () => {
    const idx = sampleRoles.findIndex((r) => r.role === editRole.role);
    if (idx > -1) {
      sampleRoles[idx].role = editRoleName;
      sampleRoles[idx].permissions = editPermissions;
    }
    setEditRole(null);
  };

  return (
    <div className="dashboard">
      {/* Filters */}
      <div className="filters">
        <label>
          Role:
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="All">All</option>
            {sampleRoles.map((r, idx) => (
              <option key={idx} value={r.role}>{r.role}</option>
            ))}
          </select>
        </label>
      </div>

      {/* Cards */}
      <div className="cards">
        <div className="card">Total Roles: {filteredRoles.length}</div>
        <div className="card">
          Total Users: {filteredRoles.reduce((acc, r) => acc + r.users, 0)}
        </div>
      </div>

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
            {filteredRoles.map((r, idx) => (
              <tr key={idx}>
                <td>{r.role}</td>
                <td>{r.users}</td>
                <td>{r.permissions}</td>
                <td>
                  <button className="btn btn-view" onClick={() => handleView(r.role)}>View</button>
                  <button className="btn btn-edit" onClick={() => handleEdit(r)}>Edit</button>
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
              {sampleUsers.filter(u => u.role === viewRole).map(u => (
                <li key={u.id}>{u.name}</li>
              ))}
            </ul>
            <div className="modal-buttons">
              <button className="btn btn-view" onClick={() => setViewRole(null)}>Close</button>
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
              <button className="btn btn-edit" onClick={handleSaveEdit}>Save</button>
              <button className="btn btn-view" onClick={() => setEditRole(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserRoles;
