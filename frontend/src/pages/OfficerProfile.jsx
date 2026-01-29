import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/admin-profile.css";
import { FaUserCircle } from "react-icons/fa";
import { toast } from "react-toastify";
import axios from "axios";
// import { jwtDecode } from "jwt-decode";   // ✅ CORRECT IMPORT

const OfficerProfile = () => {
  const navigate = useNavigate();

  const [officer, setOfficer] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role_code");

  // 🔐 AUTH CHECK + FETCH PROFILE
  useEffect(() => {
    if (!token) {
      toast.error("Please login first");
      navigate("/login");
      return;
    }

    if (role !== "OF") {
      toast.error("Unauthorized access");
      navigate("/login");
      return;
    }

    fetchOfficerProfile();
  }, []);

  // 📡 FETCH OFFICER PROFILE USING get_user_entity_by_id
  const fetchOfficerProfile = async () => {
    try {
      // 🔥 Decode token to get officer_id
      // 🔥 Get officer id directly from localStorage
const officer_id = localStorage.getItem("username");   // OFF016

console.log("🔥 Officer ID from storage:", officer_id);

if (!officer_id) {
  toast.error("Officer ID missing. Please login again.");
  navigate("/login");
  return;
}

      // 🔥 Call your unified API
      const res = await axios.get(
        `http://localhost:5000/api/user/${officer_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("🔥 FULL API RESPONSE:", res.data);

      if (!res.data || !res.data.data) {
        toast.error("Officer profile not found");
        return;
      }

      // 🔥 This is REAL officer object from DB
      const profile = res.data.data;
      console.log("🔥 REAL OFFICER PROFILE:", profile);

      setOfficer(profile);

    } catch (err) {
      console.error("Profile fetch error:", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Failed to load officer profile");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="admin-profile-page">Loading profile...</div>;
  if (!officer) return <div className="admin-profile-page">No data available</div>;

  return (
    <div className="admin-profile-page">
      {/* LEFT PROFILE */}
      <div className="profile-left">
        <div className="avatar-wrapper">
          {officer.photo ? (
            <img
              src={`http://localhost:5000/uploads/${officer.photo}`}
              alt="Officer"
              className="profile-photo"
            />
          ) : (
            <FaUserCircle className="profile-avatar" />
          )}
        </div>

        <h3>{officer.full_name || "-"}</h3>
        <p className="role">{officer.designation || "Officer"}</p>

        <div className="profile-info">
          <p><strong>Email:</strong> {officer.email_id || "-"}</p>
          <p><strong>Mobile:</strong> {officer.mobile_no || "-"}</p>
          <p>
            <strong>Status:</strong>{" "}
            {officer.is_active ? "Active" : "Inactive"}
          </p>
        </div>
      </div>

      {/* RIGHT PROFILE */}
      <div className="profile-right">

        {/* BASIC INFO */}
        <div className="info-card">
          <h4>Basic Information</h4>
          <div className="info-grid">
            <p><span>Full Name</span>{officer.full_name || "-"}</p>
            <p><span>Email</span>{officer.email_id || "-"}</p>
            <p><span>Mobile</span>{officer.mobile_no || "-"}</p>
          </div>
        </div>

        {/* ADDRESS DETAILS */}
        <div className="info-card">
          <h4>Address Details</h4>
          <div className="info-grid">
            <p><span>State</span>{officer.state_name || "-"}</p>
            <p><span>Division</span>{officer.division_name || "-"}</p>
            <p><span>District</span>{officer.district_name || "-"}</p>
            <p><span>Taluka</span>{officer.taluka_name || "-"}</p>

            <p><span>Address</span>{officer.address || "-"}</p>
            <p><span>Pincode</span>{officer.pincode || "-"}</p>
          </div>
        </div>

        {/* OFFICE DETAILS */}
        <div className="info-card">
          <h4>Officer Details</h4>
          <div className="info-grid">
            <p><span>Role</span>{officer.role_name || "-"}</p>
            <p><span>Designation</span>{officer.designation || "-"}</p>
            <p><span>Department</span>{officer.department_name || "-"}</p>
            <p><span>Organization</span>{officer.organization_name || "-"}</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default OfficerProfile;