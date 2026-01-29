import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getVisitorProfile } from "../services/api";
import "../css/Profile.css";
import { FaUserCircle } from "react-icons/fa";
import NavbarTop from "../Components/NavbarTop";
import Header from "../Components/Header";
import VisitorNavbar from "./VisitorNavbar";

function Profile() {
  const navigate = useNavigate();
  const [visitor, setVisitor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [fullName, setFullName] = useState("");

  const username = localStorage.getItem("username");

  useEffect(() => {
    if (!username) {
      setError("Session expired. Please login again.");
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await getVisitorProfile(username);

        if (res.data?.success) {
  setVisitor(res.data.data);
  setFullName(res.data.data.full_name || username);
  localStorage.setItem("visitorData", JSON.stringify(res.data.data));
}


         else {
          setError("Profile not found");
        }
      } catch (err) {
        setError("Session expired. Please login again.");
        localStorage.clear();
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username, navigate]);

  if (loading) return <div className="admin-profile-page">Loading profile...</div>;
  if (error) return <div className="admin-profile-page">{error}</div>;
  if (!visitor) return null;

  return (
    <>
    <div className="fixed-header">
        <NavbarTop />
        <Header />
        <VisitorNavbar fullName={fullName} />
      </div>

      <div className="main-layout">
        <div className="content-below">
      
    <div className="admin-profile-page">
      {/* LEFT PROFILE */}
      <div className="profile-left">
        <div className="avatar-wrapper">
          {visitor.photo ? (
            <img
              src={`http://localhost:5000/uploads/${visitor.photo}`}
              alt="Visitor"
              className="profile-photo"
            />
          ) : (
            <FaUserCircle className="profile-avatar" />
          )}
        </div>

        <h3>{visitor.full_name}</h3>
        <p className="role">Visitor</p>

       <div className="profile-info">
  <p><strong>Visitor ID:</strong> {visitor.visitor_id}</p>
  <p><strong>Email:</strong> {visitor.email_id}</p>
  <p><strong>Mobile:</strong> {visitor.mobile_no}</p>

  <span className="status">Verified</span>

  {/* 🔥 Update Profile Button */}
  <button
  className="update-profile-btn"
  onClick={() =>
    navigate("/edit-profile", {
      state: visitor
    })
  }
>
  Update Profile
</button>

</div>

      </div>

      {/* RIGHT PROFILE */}
      <div className="profile-right">
        <div className="info-card">
          <h4>Personal Information</h4>
          <div className="info-grid">
            <p><span>Full Name</span>{visitor.full_name}</p>
            <p><span>Gender</span>{visitor.gender}</p>
            <p><span>Date of Birth</span>{visitor.dob}</p>
            <p><span>Email</span>{visitor.email_id}</p>
            <p><span>Mobile</span>{visitor.mobile_no}</p>
          </div>
        </div>

        <div className="info-card">
          <h4>Address Details</h4>
          <div className="info-grid">
            <p><span>State</span>{visitor.state_name}</p>
            <p><span>Division</span>{visitor.division_name}</p>
            <p><span>District</span>{visitor.district_name}</p>
            <p><span>Taluka</span>{visitor.taluka_name}</p>
            <p><span>Pincode</span>{visitor.pincode}</p>
          </div>
        </div>
      </div>
    </div>
    </div>
</div>
    </>
  );
}

export default Profile;
