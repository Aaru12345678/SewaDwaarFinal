import React from "react";
import { FaClipboardList, FaCalendarAlt, FaChartBar, FaUsersCog } from "react-icons/fa";

const Sidebar = () => {
  return (
    <div className="sidebar">
      <h2>Admin</h2>
      <ul>
        <li><FaClipboardList /> Departments</li>
        <li><FaCalendarAlt /> Slot & Holiday Config</li>
        <li><FaClipboardList /> Appointments & Walk-in Logs</li>
        <li><FaChartBar /> Analytics & Reports</li>
        <li><FaUsersCog /> User Roles & Access</li>
      </ul>
    </div>
  );
};

export default Sidebar;
