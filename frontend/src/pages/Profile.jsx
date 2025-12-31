import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getVisitorProfile } from "../services/api";
import "../css/Profile.css";

function Profile() {
  const navigate = useNavigate();
  const [visitorData, setVisitorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const username = localStorage.getItem("username");
console.log("Username from localStorage:", username);


// const getPhotoUrl = (photo) => {
//   if (!photo) return "https://i.pravatar.cc/150";

//   if (photo.startsWith("http://") || photo.startsWith("https://")) {
//     return photo;
//   }

//   return `${process.env.REACT_APP_API_BASE_URL}/uploads/${photo}`;
// };

// const photoSrc = getPhotoUrl(visitorData.photo);



  // Build full photo URL
  // const getPhotoUrl = (photo, photoUrlFromApi) => {
  //   if (photoUrlFromApi) return photoUrlFromApi;
  //   if (!photo) return "https://i.pravatar.cc/150";
  //   if (photo.startsWith("http://") || photo.startsWith("https://")) return photo;
  //   if (photo.startsWith("data:")) return photo;
  //   const fileName = photo.includes(".") ? photo : `${photo}.jpg`;
  //   return `http://localhost:5000/uploads/${fileName}`;
  // };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString();
  };

  useEffect(() => {
    if (!username) {
      setError("Username not found, please login again.");
      setLoading(false);
      return;
    }

    let isMounted = true;

    async function fetchProfile() {
      try {
        const response = await getVisitorProfile(username);
        console.log(response,"resssss")
        if (!isMounted) return;

        if (response.data.success) {
          let profile = response.data.data || {};

          // Map backend names to frontend-friendly fields
          profile.state = profile.state_name || profile.state_code;
          profile.division = profile.division_name || profile.division_code;
          profile.district = profile.district_name || profile.district_code;
          profile.taluka = profile.taluka_name || profile.taluka_code;

          // Last login handling
          const lastLoginStored = localStorage.getItem("visitorLastLogin");
          const nowStr = new Date().toLocaleString();
          profile.lastLogin = lastLoginStored || nowStr;
          localStorage.setItem("visitorLastLogin", nowStr);

          // Cache profile for EditProfile page
          localStorage.setItem("visitorData", JSON.stringify(profile));

          setVisitorData(profile);
        } else {
          setError(response.data.message || "Profile not found");
        }
      } catch (err) {
        console.error("Error fetching profile:", err);

        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          setError("Session expired. Please login again.");
          localStorage.removeItem("token");
          localStorage.removeItem("username");
          navigate("/login");
        } else {
          setError("Server error while fetching profile");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, [username, navigate]);

  const handleEditProfile = () => {
    if (!visitorData) return;
    navigate("/edit-profile", { state: visitorData });
  };

  if (loading) return <h2 className="loading">Loading profile...</h2>;
  if (error) return <h2 className="error">{error}</h2>;
  if (!visitorData) return null;

  // const photoSrc = getPhotoUrl(visitorData.photo, visitorData.photo_url);

  return (
    <div className="profile-page">
      <div className="profile-header-banner">
        <h1>Visitor Profile</h1>
        <p>Government of India — Visitor Appointment Management Portal</p>
      </div>

      <div className="profile-card">
        {/* LEFT SIDE */}
        <div className="profile-left">
          <img src={`http://localhost:5000/uploads/${visitorData.photo}`} alt="Profile" className="profile-pic" />
          <h2 className="profile-name">{visitorData.full_name}</h2>
          <p className="profile-role">Visitor ID: {visitorData.visitor_id}</p>
          <p className="status-tag verified">Verified</p>
          <p className="last-login">Last Login: {visitorData.lastLogin}</p>

          <div className="profile-actions">
            <button className="btn primary" onClick={handleEditProfile}>
              Edit Profile
            </button>
            <button
              className="btn secondary"
              onClick={() => navigate("/change-password")}
            >
              Change Password
            </button>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="profile-right">
          <h3 className="section-title">Personal Information</h3>
          <div className="info-grid">
            <Info label="Full Name" value={visitorData.full_name} />
            <Info label="Gender" value={visitorData.gender} />
            <Info label="Date of Birth" value={formatDate(visitorData.dob)} />
            <Info label="Mobile No" value={visitorData.mobile_no} />
            <Info label="Email ID" value={visitorData.email_id} />

            <Info label="State" value={visitorData.state} />
            <Info label="Division" value={visitorData.division} />
            <Info label="District" value={visitorData.district} />
            <Info label="Taluka" value={visitorData.taluka} />

            <Info label="Pincode" value={visitorData.pincode} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="info-box">
      <strong>{label}</strong>
      <p>{value || "N/A"}</p>
    </div>
  );
}

export default Profile;
