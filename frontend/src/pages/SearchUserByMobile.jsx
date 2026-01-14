import React, { useState } from 'react';
import { getUserByMobileno } from '../services/api';
import Sidebar from './SidebarHelpdesk';
import NavbarHelpdesk from './NavbarHelpdesk';
import SignUp2 from '../Components/SignUp2';

const SearchUserByMobile = () => {
  const [mobileNo, setMobileNo] = useState('');
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showRegister, setShowRegister] = useState(false);
  const [showWizard, setShowWizard] = useState(false);


console.log(mobileNo)
const handleSearch = async () => {
  setError("");
  setUserData(null);
  setShowRegister(false);
  setShowWizard(false);

  if (!mobileNo) {
    setError("Please enter mobile number");
    return;
  }

  try {
    const res = await getUserByMobileno(mobileNo);

    console.log("API RESPONSE:", res);

    if (res?.data?.success && res?.data?.data) {
      setUserData(res.data.data); // ✅ IMPORTANT
    } else {
      setError("User not found");
      setShowRegister(true);
    }
  } catch (err) {
    setError("User not found");
    setShowRegister(true);
  }
};

console.log("userData state:", userData);


   return (
  <>
    <NavbarHelpdesk />

    <div style={{ display: "flex" }}>
      <Sidebar />

      {/* MAIN CONTENT */}
      <div
        style={{
          flex: 1,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          paddingTop: "120px" // space below navbar
        }}
      >
        <h2>Search User by Mobile Number</h2>

        {/* 🔍 Search Bar */}
        <div style={{ marginTop: "20px" }}>
          <input
            type="text"
            placeholder="Enter mobile number"
            value={mobileNo}
            maxLength={10}
            onChange={(e) => setMobileNo(e.target.value)}
            style={{ padding: "8px", width: "250px" }}
          />

          <button
            onClick={handleSearch}
            style={{ marginLeft: "10px", padding: "8px 15px" }}
          >
            Search
          </button>
        </div>

        {/* ⏳ Loading */}
        {loading && <p>Loading...</p>}

        {/* ❌ Error */}
        {error && !userData && (
          <p style={{ color: "red" }}>{error}</p>
        )}
        {showRegister && (
  <button
    style={{
      marginTop: "10px",
      padding: "8px 20px",
      backgroundColor: "#28a745",
      color: "#fff",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer"
    }}
    onClick={() => setShowWizard(true)}
  >
    Register User
  </button>
)}
{showWizard && (
  <div style={{ marginTop: "30px", width: "80%" }}>
    <SignUp2 mobileNo={mobileNo} />
  </div>
)}

        {/* 📊 Result */}
        {userData && (
          <table className="table table-bordered mt-4" style={{ width: "60%" }}>
            <tbody>
              <tr><th>Full Name</th><td>{userData.full_name}</td></tr>
              <tr><th>Username</th><td>{userData.username}</td></tr>
              <tr><th>Mobile No</th><td>{userData.mobile_no}</td></tr>
              <tr><th>Email</th><td>{userData.email_id}</td></tr>
              <tr><th>Gender</th><td>{userData.gender}</td></tr>
              <tr><th>DOB</th><td>{userData.dob}</td></tr>
              <tr><th>Role</th><td>{userData.role_code}</td></tr>
              <tr><th>State</th><td>{userData.state_code}</td></tr>
              <tr><th>Division</th><td>{userData.division_code}</td></tr>
              <tr><th>District</th><td>{userData.district_code}</td></tr>
              <tr><th>Taluka</th><td>{userData.taluka_code || "-"}</td></tr>
            </tbody>
          </table>
        )}
      </div>
    </div>
  </>
);

    

};

export default SearchUserByMobile;
