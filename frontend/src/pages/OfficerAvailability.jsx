import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiCheckCircle, FiAlertCircle, FiClock } from "react-icons/fi";
import NavbarHelpdesk from "../pages/NavbarHelpdesk";
import SidebarHelpdesk from "../pages/SidebarHelpdesk";
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import "../css/OfficerAvailability.css";

const OfficerAvailability = () => {
  const navigate = useNavigate();
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [activeMenu, setActiveMenu] = useState("availability");

  const helpdeskId = localStorage.getItem("helpdesk_id");
  const username = localStorage.getItem("helpdesk_username");
  const locationId = localStorage.getItem("helpdesk_location");

  // Generate time slots (10 AM - 5 PM, 15 min each)
  const generateTimeSlots = () => {
    const slots = [];
    for (let h = 10; h < 17; h++) {
      for (let m = 0; m < 60; m += 15) {
        slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  const fetchOfficers = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `http://localhost:5000/api/helpdesk/helpdesks/${username}/officers/availability?date=${selectedDate}`
      );
      const data = await res.json();
      
      if (data.success) {
        setOfficers(data.officers || []);
      }
    } catch (error) {
      console.error("Error fetching officers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (helpdeskId) fetchOfficers();
  }, [selectedDate, helpdeskId]);

  const getBookedSlots = (appointments) => {
    return new Set(appointments.map((a) => a.slot_time));
  };

  const getAvailableCount = (appointments) => {
    const bookedSlots = getBookedSlots(appointments);
    return timeSlots.length - bookedSlots.size;
  };

  const formatTime = (time) => {
    const [h, m] = time.split(":");
    const hour = parseInt(h);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayH = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayH}:${m} ${ampm}`;
  };

  return (
    <div>
      <Header />
      <div className="helpdesk-layout">
        <SidebarHelpdesk activeMenu={activeMenu} onMenuClick={setActiveMenu} />

        <div className="helpdesk-main">
          <NavbarHelpdesk username={username} onLogout={() => {
            localStorage.removeItem("helpdesk_id");
            localStorage.removeItem("helpdesk_username");
            localStorage.removeItem("helpdesk_role");
            localStorage.removeItem("helpdesk_location");
            navigate("/login");
          }} />

          <div className="helpdesk-content">
            <div className="officer-availability">
              <div className="oa-header">
                <button className="oa-back-btn" onClick={() => navigate("/helpdesk/dashboard")}>
                  <FiArrowLeft /> Back
                </button>
                <h1>Officer Availability</h1>
                <div className="oa-date-picker">
                  <label>Select Date:</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
              </div>

              <div className="oa-content">
                {loading ? (
                  <div className="oa-loading">
                    <div className="oa-spinner"></div>
                    <p>Loading...</p>
                  </div>
                ) : officers.length === 0 ? (
                  <p className="oa-no-data">No officers available</p>
                ) : (
                  <div className="oa-grid">
                    {officers.map((officer) => {
                      const bookedSlots = getBookedSlots(officer.appointments || []);
                      const availableCount = getAvailableCount(officer.appointments || []);

                      return (
                        <div key={officer.officer_id} className="oa-card">
                          <div className="oa-card-header">
                            <div>
                              <h3>{officer.officer_name}</h3>
                              <p className="oa-dept">{officer.department_name}</p>
                            </div>
                            <div className="oa-status">
                              {availableCount === timeSlots.length ? (
                                <div className="oa-badge available">
                                  <FiCheckCircle />
                                  <span>Available</span>
                                </div>
                              ) : availableCount > 0 ? (
                                <div className="oa-badge partial">
                                  <FiClock />
                                  <span>{availableCount} slots</span>
                                </div>
                              ) : (
                                <div className="oa-badge booked">
                                  <FiAlertCircle />
                                  <span>Booked</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="oa-slots">
                            <h4>Available Times</h4>
                            <div className="oa-slot-grid">
                              {timeSlots.map((slot) => (
                                <div
                                  key={slot}
                                  className={`oa-slot ${
                                    bookedSlots.has(slot) ? "booked" : "available"
                                  }`}
                                  title={
                                    bookedSlots.has(slot)
                                      ? "Booked"
                                      : "Available"
                                  }
                                >
                                  {formatTime(slot)}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default OfficerAvailability;