import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/admin-profile.css";
import { FaUserCircle } from "react-icons/fa";
import { toast } from "react-toastify";
import axios from "axios";

const AdminProfile = () => {
  const navigate = useNavigate();

  const [admin, setAdmin] = useState(null);
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

    if (role !== "AD") {
      toast.error("Unauthorized access");
      navigate("/login");
      return;
    }

    fetchAdminProfile();
  }, [token, role]);

  // 📡 FETCH ADMIN PROFILE
  const fetchAdminProfile = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/profile/me",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.data.success) {
        toast.error(res.data.message || "Admin profile not found");
        return;
      }

      setAdmin(res.data.data);
    } catch (err) {
      console.error("Profile fetch error:", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Failed to load admin profile");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="admin-profile-page">Loading profile...</div>;
  if (!admin) return <div className="admin-profile-page">No data available</div>;

  return (
    <div className="admin-profile-page">
      {/* LEFT PROFILE */}
      <div className="profile-left">
        <div className="avatar-wrapper">
          {admin.photo ? (
            <img
              src={`http://localhost:5000/uploads/${admin.photo}`}
              alt="Admin"
              className="profile-photo"
            />
          ) : (
            <FaUserCircle className="profile-avatar" />
          )}
        </div>

        <h3>{admin.full_name || "-"}</h3>
        <p className="role">{admin.designation || "Administrator"}</p>

        <div className="profile-info">
          <p><strong>Email:</strong> {admin.email_id || "-"}</p>
          <p><strong>Mobile:</strong> {admin.mobile_no || "-"}</p>
          <p>
            <strong>Status:</strong>{" "}
            {admin.is_active ? "Active" : "Inactive"}
          </p>
        </div>
      </div>

      {/* RIGHT PROFILE */}
      <div className="profile-right">
        {/* BASIC INFO */}
        <div className="info-card">
          <h4>Basic Information</h4>
          <div className="info-grid">
            <p><span>Full Name</span>{admin.full_name || "-"}</p>
            <p><span>Email</span>{admin.email_id || "-"}</p>
            <p><span>Mobile</span>{admin.mobile_no || "-"}</p>
          </div>
        </div>

        {/* ADDRESS DETAILS */}
{/* ADDRESS DETAILS (NAMES FROM DB) */}
<div className="info-card">
  <h4>Address Details</h4>
  <div className="info-grid">
    <p><span>State</span>{admin.state_name || "-"}</p>
    <p><span>Division</span>{admin.division_name || "-"}</p>
    <p><span>District</span>{admin.district_name || "-"}</p>
    <p><span>Taluka</span>{admin.taluka_name || "-"}</p>

    <p><span>Address</span>{admin.address || "-"}</p>
    <p><span>Pincode</span>{admin.pincode || "-"}</p>
  </div>
</div>

        {/* OFFICE DETAILS */}
<div className="info-card">
  <h4>Officer Details</h4>
  <div className="info-grid">
    <p><span>Role</span>{admin.role_name || "-"}</p>              {/* 🔥 NEW */}
    <p><span>Designation</span>{admin.designation || "-"}</p>
    <p><span>Department</span>{admin.department_name || "-"}</p>
    <p><span>Organization</span>{admin.organization_name || "-"}</p> {/* 🔥 NEW */}
  </div>
</div>
      </div>
    </div>
  );
};

export default AdminProfile;