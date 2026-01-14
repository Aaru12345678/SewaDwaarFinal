import React, { useState } from "react";
import Analytics1 from "./Analytics1";
import WalkInAppointments from "./WalkInAppointments";
// import TotalAppointments from "./TotalAppointments";
import AppointmentFilters from "../Components/AppointmentFilters";
import "../css/AppointmentsTab.css";

const AppointmentsTab = () => {
  const [activeTab, setActiveTab] = useState("analytics");

  // Applied filters (after clicking Apply)
  const [appliedFilters, setAppliedFilters] = useState(null);

  const handleApplyFilters = (filters) => {
    setAppliedFilters(filters);
  };

  return (
    <div className="appointments-container">
      {/* ================= PAGE HEADER ================= */}
      <div className="page-header">
        <h2 className="page-title">Appointments Analytics Dashboard</h2>
      </div>

      {/* ================= FILTERS ================= */}
      <div className="filters-section">
        <AppointmentFilters onApply={handleApplyFilters} />
      </div>

      {/* ================= TABS ================= */}
      <div className="tab-buttons">
        <button
          className={activeTab === "analytics" ? "active" : ""}
          onClick={() => setActiveTab("analytics")}
        >
          Application Appointments
        </button>

        <button
          className={activeTab === "walkin" ? "active" : ""}
          onClick={() => setActiveTab("walkin")}
        >
          Walk-in Appointments
        </button>

        {/* <button
          className={activeTab === "total" ? "active" : ""}
          onClick={() => setActiveTab("total")}
        >
          Combined Analysis
        </button> */}
      </div>

      {/* ================= TAB CONTENT ================= */}
      <div className="tab-content">
        {activeTab === "analytics" && (
          <Analytics1 filters={appliedFilters} />
        )}

        {activeTab === "walkin" && (
          <WalkInAppointments filters={appliedFilters} />
        )}

        {/* {activeTab === "total" && (
          <TotalAppointments filters={appliedFilters} />
        )} */}
      </div>
    </div>
  );
};

export default AppointmentsTab;
