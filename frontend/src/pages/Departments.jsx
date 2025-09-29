import React, { useState } from "react";
import { FaBuilding, FaUser, FaEdit, FaTrash } from "react-icons/fa";
import "../css/departments.css";

const Departments = () => {
  const [departments, setDepartments] = useState([
    { id: 1, name: "IT", officers: 3, status: "Active" },
    { id: 2, name: "HR", officers: 2, status: "Inactive" },
  ]);

  const [officers, setOfficers] = useState([
    { id: 1, departmentId: 1, name: "John Doe", role: "Manager", email: "john@example.com", status: "Active" },
    { id: 2, departmentId: 1, name: "Jane Smith", role: "Developer", email: "jane@example.com", status: "Active" },
    { id: 3, departmentId: 2, name: "Alice Brown", role: "HR Executive", email: "alice@example.com", status: "Inactive" },
  ]);

  const [selectedDept, setSelectedDept] = useState(null);
  const [search, setSearch] = useState("");

  const filteredDepartments = departments.filter(dep =>
    dep.name.toLowerCase().includes(search.toLowerCase())
  );

  const filteredOfficers = officers.filter(officer =>
    selectedDept && officer.departmentId === selectedDept.id &&
    officer.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="departments-page">
      {/* Header */}
      <div className="departments-header">
        <h1><FaBuilding /> Departments & Officers</h1>
        <div>
          <button className="add-department">Add Department</button>
          <button className="add-officer">Add Officer</button>
        </div>
      </div>

      {/* Search */}
      <div className="departments-search">
        <input
          type="text"
          placeholder="Search Department or Officer"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Quick Stats */}
      <div className="stats-cards">
        <div className="stats-card">
          <h2>{departments.length}</h2>
          <p>Total Departments</p>
        </div>
        <div className="stats-card">
          <h2>{officers.filter(o => o.status === "Active").length}</h2>
          <p>Active Officers</p>
        </div>
        <div className="stats-card">
          <h2>{officers.filter(o => o.status !== "Active").length}</h2>
          <p>Inactive Officers</p>
        </div>
      </div>

      {/* Department List */}
      <div className="table-container">
        <h2>Departments</h2>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>No. of Officers</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDepartments.map(dep => (
              <tr key={dep.id} onClick={() => setSelectedDept(dep)}>
                <td><FaBuilding className="icon" /> {dep.name}</td>
                <td>{dep.officers}</td>
                <td>{dep.status}</td>
                <td className="actions">
                  <button className="edit"><FaEdit /></button>
                  <button className="delete"><FaTrash /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Officer List */}
      {selectedDept && (
        <div className="table-container">
          <h2>Officers in {selectedDept.name}</h2>
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
              {filteredOfficers.map(officer => (
                <tr key={officer.id}>
                  <td><FaUser className="icon" /> {officer.name}</td>
                  <td>{officer.role}</td>
                  <td>{officer.email}</td>
                  <td>{officer.status}</td>
                  <td className="actions">
                    <button className="edit"><FaEdit /></button>
                    <button className="delete"><FaTrash /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Departments;
