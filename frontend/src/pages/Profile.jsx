import React, { useState, useEffect } from "react";
import "../css/Profile.css";

function Profile() {
  const [visitorData, setVisitorData] = useState({
    visitorId: "VIS2025-1034",
    name: "Ravi Tambe",
    email: "ravi.tambe@example.com",
    phone: "+91 9876543210",
    gender: "Male",
    dob: "1992-07-15",
    address: "Flat No. 204, Pristine Residency, Pune, Maharashtra, 411001",
    state: "Maharashtra",
    division: "Pune Division",
    district: "Pune",
    taluka: "Haveli",
    pincode: "411001",
    idProofType: "Aadhaar Card",
    idProofNo: "XXXX-XXXX-4567",
    purpose: "Meeting with Regional Officer for Project Clearance",
    visitDate: "2025-10-08",
    timeSlot: "10:30 AM – 11:15 AM",
    department: "Urban Development Department",
    organization: "Government of Maharashtra",
    status: "Verified",
    joinedDate: "2025-01-15",
    profilePic: "https://i.pravatar.cc/150?img=12",
    lastLogin: null,
  });

  useEffect(() => {
    // Fetch or simulate last login time
    const lastLogin = localStorage.getItem("visitorLastLogin") || new Date().toLocaleString();
    setVisitorData((prev) => ({ ...prev, lastLogin }));
    localStorage.setItem("visitorLastLogin", new Date().toLocaleString());
  }, []);

  return (
    <div className="profile-page">
      {/* Header */}
      <div className="profile-header-banner">
        <h1>Visitor Profile</h1>
        <p>Government of India — Digital Visitor Management System (DVMS)</p>
      </div>

      {/* Profile Card */}
      <div className="profile-card">
        {/* Left Column */}
        <div className="profile-left">
          <img
            src={visitorData.profilePic}
            alt="Profile"
            className="profile-pic"
          />
          <h2 className="profile-name">{visitorData.name}</h2>
          <p className="profile-role">Visitor ID: {visitorData.visitorId}</p>
          <p className={`status-tag ${visitorData.status.toLowerCase()}`}>
            {visitorData.status}
          </p>

          {/* Last Login */}
          <p className="last-login">
            Last Login: {visitorData.lastLogin || "N/A"}
          </p>

          <div className="profile-actions">
            <button className="btn primary">Edit Profile</button>
            <button className="btn secondary">Change Password</button>
          </div>
        </div>

        {/* Right Column */}
        <div className="profile-right">
          <h3 className="section-title">Personal Information</h3>
          <div className="info-grid">
            <div className="info-box"><strong>Full Name</strong><p>{visitorData.name}</p></div>
            <div className="info-box"><strong>Gender</strong><p>{visitorData.gender}</p></div>
            <div className="info-box"><strong>Date of Birth</strong><p>{visitorData.dob}</p></div>
            <div className="info-box"><strong>Mobile No</strong><p>{visitorData.phone}</p></div>
            <div className="info-box"><strong>Email ID</strong><p>{visitorData.email}</p></div>
            <div className="info-box"><strong>Address</strong><p>{visitorData.address}</p></div>
            <div className="info-box"><strong>State</strong><p>{visitorData.state}</p></div>
            <div className="info-box"><strong>Division</strong><p>{visitorData.division}</p></div>
            <div className="info-box"><strong>District</strong><p>{visitorData.district}</p></div>
            <div className="info-box"><strong>Taluka</strong><p>{visitorData.taluka}</p></div>
            <div className="info-box"><strong>Pincode</strong><p>{visitorData.pincode}</p></div>
              </div>

          <h3 className="section-title">Visit Information</h3>
          <div className="info-grid">
            <div className="info-box"><strong>Purpose of Visit</strong><p>{visitorData.purpose}</p></div>
            <div className="info-box"><strong>Visit Date</strong><p>{visitorData.visitDate}</p></div>
            <div className="info-box"><strong>Time Slot</strong><p>{visitorData.timeSlot}</p></div>
            <div className="info-box"><strong>Joined Date</strong><p>{visitorData.joinedDate}</p></div>
            <div className="info-box"><strong>Department</strong><p>{visitorData.department}</p></div>
            <div className="info-box"><strong>Organization</strong><p>{visitorData.organization}</p></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
