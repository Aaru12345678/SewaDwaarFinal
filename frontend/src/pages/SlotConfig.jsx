import React, { useState } from "react";
import { FaClock, FaCalendarAlt, FaEdit, FaTrash } from "react-icons/fa";
import "../css/slotHoliday.css"; // reuse same CSS
import { useNavigate } from "react-router-dom";

const SlotConfig = () => {
  const [slots, setSlots] = useState([
    { id: 1, name: "Morning Slot", time: "09:00 - 12:00", department: "IT", capacity: 10, status: "Active" },
    { id: 2, name: "Afternoon Slot", time: "13:00 - 16:00", department: "HR", capacity: 8, status: "Inactive" },
  ]);
const navigate = useNavigate();

  const [holidays, setHolidays] = useState([
    { id: 1, name: "Independence Day", date: "2025-08-15", description: "National Holiday" },
    { id: 2, name: "Christmas", date: "2025-12-25", description: "" },
  ]);

  const [search, setSearch] = useState("");

  const filteredSlots = slots.filter(slot =>
    slot.name.toLowerCase().includes(search.toLowerCase())
  );

  const filteredHolidays = holidays.filter(holiday =>
    holiday.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="slot-holiday-page">
      {/* Header */}
      <div className="header">
        <h1><FaClock /> Slot & Holiday Configuration</h1>
        <div>
          <button className="add-slot">Add Slot</button>
         <button 
  className="add-holiday"
  onClick={() => navigate("/add/holiday")}
>
  Add Holiday
</button>

        </div>
      </div>

      {/* Search */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search Slot or Holiday"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Quick Stats */}
      <div className="stats-cards">
        <div className="stats-card">
          <h2>{slots.length}</h2>
          <p>Total Slots</p>
        </div>
        <div className="stats-card">
          <h2>{slots.filter(s => s.status === "Active").length}</h2>
          <p>Active Slots</p>
        </div>
        <div className="stats-card">
          <h2>{holidays.length}</h2>
          <p>Total Holidays</p>
        </div>
      </div>

      {/* Slot Table */}
      <div className="table-container">
        <h2>Slots</h2>
        <table>
          <thead>
            <tr>
              <th>Slot Name</th>
              <th>Time</th>
              <th>Department</th>
              <th>Capacity</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSlots.map(slot => (
              <tr key={slot.id}>
                <td><FaClock className="icon" /> {slot.name}</td>
                <td>{slot.time}</td>
                <td>{slot.department}</td>
                <td>{slot.capacity}</td>
                <td>{slot.status}</td>
                <td className="actions">
                  <button className="edit"><FaEdit /></button>
                  <button className="delete"><FaTrash /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Holiday Table */}
      <div className="table-container">
        <h2>Holidays</h2>
        <table>
          <thead>
            <tr>
              <th>Holiday Name</th>
              <th>Date</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredHolidays.map(holiday => (
              <tr key={holiday.id}>
                <td><FaCalendarAlt className="icon" /> {holiday.name}</td>
                <td>{holiday.date}</td>
                <td>{holiday.description}</td>
                <td className="actions">
                  <button className="edit"><FaEdit /></button>
                  <button className="delete"><FaTrash /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SlotConfig;
