import React from "react";
import "../css/StatsRow.css";

const StatsRow = ({ stats, onCircleClick }) => {
const statItems = [
  { type: "today", icon: "📅", number: stats.today, label: "Today's Appointments" },
  { type: "completed", icon: "✅", number: stats.completed, label: "Completed" },
  { type: "pending", icon: "⏳", number: stats.pending, label: "Pending" },
  { type: "rescheduled", icon: "🔁", number: stats.rescheduled, label: "Rescheduled" },
  { type: "walkins", icon: "🚶", number: stats.walkins, label: "Walk-ins" },
];

  return (
    <div className="stats-row">
      {statItems.map((s) => (
        <div
          key={s.type}
          className={`stat-circle ${s.type}`}
          onClick={() => onCircleClick(s.type)}
        >
          <div className="stat-icon">{s.icon}</div>
          <div className="stat-number">{s.number}</div>
          <div className="stat-label">{s.label}</div>
        </div>
      ))}
    </div>
  );
};

export default StatsRow;
