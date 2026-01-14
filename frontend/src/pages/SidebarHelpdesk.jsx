import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../css/Sidebar.css";

const Sidebar = ({ activeMenu, onMenuClick }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menu = [
    { key: "dashboard", label: "Dashboard", icon: "📊", to: "/helpdesk/dashboard", internal: true },
    { key: "all-appointments", label: "Appointments", icon: "📅", to: "/helpdesk/dashboard", internal: true },
    { key: "booking", label: "Book Appointment", icon: "➕", to: "/helpdesk/dashboard", internal: true },
    { key: "user", label: "Search User", icon: "🔍", to: "/helpdesk/search-user", internal: true },
    { key: "availability", label: "Officer Availability", icon: "⏰", to: "/helpdesk/availability", internal: false },
  ];

  const isActive = (key) => activeMenu === key || location.pathname === menu.find(m => m.key === key)?.to;

  const handleClick = (item) => {
  if (onMenuClick) {
    onMenuClick(item.key);
  }

  if (item.to) {
    navigate(item.to);
  }
};

  return (
    <aside className="helpdesk-sidebar">
      <div className="sidebar-header">
        <span 
          className="sidebar-logo" 
          onClick={() => navigate("/")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && navigate("/")}
          title="Go to Home"
        >
          🏠
        </span>
      </div>
      <nav className="sidebar-menu">
        {menu.map((m) => (
          <div
            key={m.key}
            className={`sidebar-item ${isActive(m.key) ? "active" : ""}`}
            onClick={() => handleClick(m)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && handleClick(m)}
          >
            <span className="icon">{m.icon}</span>
            <span className="label">{m.label}</span>
          </div>
        ))}
      </nav>


    </aside>
  );
};

export default Sidebar;



