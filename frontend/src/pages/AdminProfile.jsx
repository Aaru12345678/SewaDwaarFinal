import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/admin-profile.css";
import { FaUserCircle } from "react-icons/fa";
import { toast } from "react-toastify";
import axios from "axios";
import jwtDecode from "jwt-decode";   // 🔥 IMPORTANT
import { getUserByEntityId } from "../services/api";

const AdminProfile = () => {
  const navigate = useNavigate();

  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role_code");

  // 🔐 AUTH CHECK + FETCH PROFILE
  // useEffect(() => {
  //   if (!token) {
  //     toast.error("Please login first");
  //     navigate("/login");
  //     return;
  //   }

  //   if (role !== "AD") {
  //     toast.error("Unauthorized access");
  //     navigate("/login");
  //     return;
  //   }

  //   fetchAdminProfile();
  // }, []);

  // 📡 FETCH ADMIN PROFILE USING YOUR CONTROLLER
  const [formData, setFormData] = useState({
  full_name: "",
  email_id: "",
  mobile_no: "",
  state_name: "",
  division_name: "",
  district_name: "",
  taluka_name: "",
  address: "",
  pincode: "",
  role_name: "",
  designation: "",
  department_name: "",
  organization_name: ""
});
const fetchAdminProfile = async () => {
  try {
    const entityId = localStorage.getItem("username"); // ADM001

    if (!entityId) {
      toast.error("Session expired. Please login again.");
      navigate("/login");
      return;
    }

    const res = await getUserByEntityId(entityId);

    console.log("🔥 FULL API RESPONSE:", res);
    console.log("🔥 PROFILE WRAPPER:", res.data.data);
    console.log("🔥 REAL PROFILE DATA:", res.data.data.data);

    if (!res.data?.success) {
      toast.error(res.data?.message || "Admin profile not found");
      return;
    }

    // 🔥 THIS IS THE REAL ADMIN OBJECT
    const profile = res.data.data;

    setAdmin(profile);

  } catch (err) {
    console.error("Profile fetch error:", err);
    toast.error("Failed to load admin profile");
  } finally {
    setLoading(false);
  }
};
const handleChange = (e) => {
  const { name, value } = e.target;
  setFormData(prev => ({
    ...prev,
    [name]: value
  }));
};
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
}, []);


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
            <p><span>Role</span>{admin.role_name || "-"}</p>
            <p><span>Designation</span>{admin.designation || "-"}</p>
            <p><span>Department</span>{admin.department_name || "-"}</p>
            <p><span>Organization</span>{admin.organization_name || "-"}</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminProfile;