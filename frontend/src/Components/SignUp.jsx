import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
//  import { toast } from "react-toastify";
import "../css/Signup.css";
import { Link } from "react-router-dom";
 import SHA256 from "crypto-js/sha256";
import {
  getStates,
  getDivisions,
  getDistricts,
  getTalukas,
  getDepartments,
  getMinistry,
  submitSignup,
} from "../services/api";
 import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
 import { faUniversalAccess, faLock, faLockOpen } from "@fortawesome/free-solid-svg-icons";
import logo from "../assets/emblem.png";

export default function SignUp() {
  const [formData, setFormData] = useState({
  full_name: "",
  email_id: "",
  mobile_no: "",
  gender: "",
  dob: "",
  address: "",
  pincode: "",
  password: "",
  confirmPassword: "",
  photo: "",
  state: "",
  division: "",
  district: "",
  taluka: "",
});

const navigate = useNavigate();
  const [states, setStates] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [talukas, setTalukas] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [ministry, setMinistry] = useState([]);

  const [onboardMode, setOnboardMode] = useState("location");
  const [stateOption, setStateOption] = useState("");
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [passwordStrength, setPasswordStrength] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingDivisions, setLoadingDivisions] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingTalukas, setLoadingTalukas] = useState(false);
  const [loadingDepartment, setLoadingDepartments] = useState(false);
  const [loadingMinistry, setLoadingMinistry] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;

  // Fetch helpers
  const fetchDivisions = useCallback(async (stateCode) => {
    if (!stateCode) return;
    setLoadingDivisions(true);
    const { data } = await getDivisions(stateCode);
    setLoadingDivisions(false);
    data ? setDivisions(data) : toast.error("Failed to load divisions.");
  }, []);

  
  const fetchDistricts = useCallback(async (stateCode, divisionCode) => {
    if (!stateCode || !divisionCode) return;
    setLoadingDistricts(true);
    const { data } = await getDistricts(stateCode, divisionCode);
    setLoadingDistricts(false);
    data ? setDistricts(data) : toast.error("Failed to load districts.");
  }, []);

  const fetchTalukas = useCallback(async (stateCode, divisionCode, districtCode) => {
    if (!stateCode || !divisionCode || !districtCode) return;
    setLoadingTalukas(true);
    const { data } = await getTalukas(stateCode, divisionCode, districtCode);
    setLoadingTalukas(false);
    data ? setTalukas(data) : toast.error("Failed to load talukas.");
  }, []);

//   const fetchMinistry = useCallback(async () => {
//     setLoadingMinistry(true);
//     const { data } = await getMinistry();
//     setLoadingMinistry(false);
//     data ? setMinistry(data) : toast.error("Failed to load ministry.");
//   }, []);

  useEffect(() => {
    (async () => {
      setLoadingStates(true);
      const { data } = await getStates();
      setLoadingStates(false);
      data ? setStates(data) : toast.error("Failed to load states.");
    })();
  }, []);

//   useEffect(() => {
//     if (onboardMode === "ministry") fetchMinistry();
//   }, [onboardMode, fetchMinistry]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const updated = { ...prev, [name]: value };

      if (name === "password") {
        setPasswordStrength(passwordRegex.test(value));
        setPasswordMatch(value === prev.confirmPassword);
      }
      if (name === "confirmPassword") {
        setPasswordMatch(prev.password === value);
      }

      // Reset dependent selects
      if (name === "state") {
  updated.division = updated.district = updated.taluka = updated.department = "";
  setDivisions([]);
  setDistricts([]);
  setTalukas([]);
  setDepartments([]);

  if (value) {
    fetchDivisions(value);   // ✅ trigger divisions API
  }
}
      if (name === "division") {
        updated.district = updated.taluka = "";
        setDistricts([]);
        setTalukas([]);
        if (value) fetchDistricts(prev.state, value);
      }

      if (name === "district") {
        updated.taluka = "";
        setTalukas([]);
        if (value) fetchTalukas(prev.state, prev.division, value);
      }

      // if (name === "ministry") {
      //   updated.division = updated.district = updated.taluka = updated.department = "";
      //   setDivisions([]);
      //   setDistricts([]);
      //   setTalukas([]);
      //   setDepartments([]);
      // }

      return updated;
    });
  };

  const isFormValid = useMemo(() => {
    const { full_name, email, password, confirmPassword } = formData;
    return !!full_name && !!email && !!password && !!confirmPassword && passwordMatch && passwordStrength && !submitting;
  }, [formData, passwordMatch, passwordStrength, submitting]);

 
const handleSubmit = async (e) => {
  e.preventDefault();

  // 🔹 Basic front-end validation
  if (!formData.full_name || !formData.email_id || !formData.password) {
    return toast.error("Please fill all required fields.");
  }
  if (formData.password !== formData.confirmPassword) {
    return toast.error("Passwords do not match.");
  }

  setSubmitting(true);

  try {
    const { confirmPassword, ...rest } = formData;
    const payload = new FormData();

Object.keys(rest).forEach((key) => {
  if (rest[key] !== null && rest[key] !== undefined && key !== "photo") {
    payload.append(key, rest[key]);
  }
});

// ✅ Append photo separately
if (formData.photo) {
  payload.append("photo", formData.photo); // File object
}


    // ✅ Do NOT set Content-Type manually
    const response = await submitSignup(payload);

    if (response.error) {
      const backendMsg = response.error.response?.data?.message || response.error.response?.data?.error;
      toast.error(backendMsg || "Signup failed.");
    } else {
      toast.success("Signup successful! Redirecting to login...", { autoClose: 2000 });

      setTimeout(() => navigate("/login/visitorlogin"), 2000);

      // Reset form
      setFormData({
        full_name: "",
        email_id: "",
        mobile_no: "",
        gender: "",
        dob: "",
        address: "",
        pincode: "",
        password: "",
        confirmPassword: "",
        photo: "",
        state: "",
        division: "",
        district: "",
        taluka: "",
      });
    }
  } catch (err) {
    console.error("Signup error:", err);
    toast.error("Signup failed. Please try again.");
  } finally {
    setSubmitting(false);
  }
};



  const renderOptions = (list, keyField, labelField) =>
    list.map((i) => (
      <option key={i[keyField]} value={i[keyField]}>
        {i[labelField]}
      </option>
    ));

  return (
    <div className="container">
      <header className="header">
        <div className="logo-group">
          <Link to="/">
            <img src={logo} alt="India Logo" className="logo" />
          </Link>
          <div className="gov-text">
            <p className="hindi">महाराष्ट्र शासन</p>
            <p className="english">Government of Maharashtra</p>
          </div>
        </div>
        <div className="right-controls">
          <span className="lang">अ/A</span>
          <span className="access">
            <FontAwesomeIcon icon={faUniversalAccess} size="1x" className="access" />
          </span>
        </div>
      </header>

      <main className="login-box">
        <h2 className="login-title">SignUp</h2>
        <form className="form-grid form" onSubmit={handleSubmit}>
          {/* Name Row */}
          <div className="form-field inline">
            {/* {["fname", "mname", "lname"].map((n) => (
              <div className="form-field inline" key={n}>
                <label htmlFor={n}>
                  {n === "fname" ? "First name" : n === "mname" ? "Middle name" : "Last name"} {n === "fname" && <span className="required">*</span>}
                </label>
                <input id={n} name={n} value={formData[n]} 
                // onChange={handleChange} 
                required={n === "fname"} />
              </div>
            ))} */}
            <div className="form-field inline">
              <label htmlFor="fullname">Full Name <span className="required">*</span></label>
              <input id="full_name" type="full_name" name="full_name" value={formData.full_name} 
               onChange={handleChange} 
              required />
            </div>
          </div>

          {/* Contact Row */}
          <div className="form-row contact-row">
            <div className="form-field inline">
              <label htmlFor="email">Email <span className="required">*</span></label>
              <input id="email_id" type="email" name="email_id" value={formData.email_id} 
               onChange={handleChange} 
              required />
            </div>
            <div className="form-field inline">
              <label htmlFor="mobile">Mobile<span className="required">*</span></label>
              <input id="mobile_no" name="mobile_no" value={formData.mobile_no} 
               onChange={handleChange} 
              />
            </div>
          </div>
            <div className="form-row contact-row">
            <div className="form-field inline">
                <label htmlFor="gender">Select Gender<span className="required">*</span></label>
                <select id="gender" name="gender" value={formData.gender} onChange={handleChange}>
  <option value="">Select Gender</option>
  <option value="Male">M</option>
  <option value="Female">F</option>
  <option value="Other">O</option>
</select>
              </div>
            <div className="form-field inline">
              <label htmlFor="mobile">Date Of Birth</label>
              <input id="dob" type="date" name="dob" value={formData.dob} 
               onChange={handleChange} 
              />
            </div>
          </div>   

            <div className="form-row contact-row">

           <div className="form-field inline">
              <label htmlFor="address">Address<span className="required">*</span></label>
              <input id="address" name="address" value={formData.address} 
             onChange={handleChange} 
              />
            </div>
            <div className="form-field inline">
              <label htmlFor="pincode">PinCode<span className="required">*</span></label>
              <input id="pincode" name="pincode" value={formData.pincode} 
               onChange={handleChange} 
              />
            </div>
            </div>

          {/* Password Row */}
          <div className="form-row password-row">
            {["password", "confirmPassword"].map((p) => (
              <div className="form-field inline" key={p}>
                <label htmlFor={p}>{p === "password" ? "Password" : "Confirm Password"} <span className="required">*</span></label>
                <div className="password-wrap">
                  <input
                    id={p}
                    type={p === "password" ? (showPassword ? "text" : "password") : showConfirm ? "text" : "password"}
                    name={p}
                    value={formData[p]}
                     onChange={handleChange}
                    required
                  />
                  <button type="button" className="eye-btn" onClick={() => p === "password" ? setShowPassword(s => !s) : setShowConfirm(s => !s)}>
                    {p === "password" ? (showPassword ? "🔓" : "🔒") : showConfirm ? "🔓" : "🔒"}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Password Helper */}
          {!passwordStrength && <p className="error-text full">Password must be 8+ chars, include 1 uppercase, 1 number and 1 special character.</p>}
          {!passwordMatch && <p className="error-text full">Passwords do not match.</p>}

          {/* Onboard Mode */}
          {/* <div className="form-row">
            <div className="form-field inline">
              <label>Onboard as</label>
              <div className="radio-wrap">
                <label>
                  <input type="radio" name="onboardMode" value="location" checked={onboardMode === "location"} onChange={() => { setOnboardMode("location"); setStateOption(""); }} /> State
                </label>
                <label>
                  <input type="radio" name="onboardMode" value="ministry" checked={onboardMode === "ministry"} onChange={() => { setOnboardMode("ministry"); setStateOption(""); }} /> Central
                </label>
              </div>
            </div>
          </div> */}

          <div className="form-field inline">
              <label htmlFor="address">Photo<span className="required">*</span></label>
              <input
  type="file"
  name="photo"
  accept="image/*"
  onChange={(e) =>
    setFormData({ ...formData, photo: e.target.files[0] }) // File object
  }
/>



            </div>

          {/* Location flow */}
          {onboardMode === "location" && (
            <div className="form-field inline" style={{ marginTop: 8 }}>
              <div className="form-field inline">
                <label htmlFor="state">State<span className="required">*</span></label>
                <select id="state" name="state" value={formData.state} onChange={handleChange}>
                  <option value="">{loadingStates ? "Loading..." : "Select State"}</option>
                  {renderOptions(states, "state_code", "state_name")}
                </select>
              </div>
              {/* <label>Choose Type</label>
              <div className="radio-wrap">
                <label>
                  <input type="radio" name="stateOption" value="division" checked={stateOption === "division"} onChange={() => setStateOption("division")} /> Division
                </label>
                <label>
                  <input type="radio" name="stateOption" value="department" checked={stateOption === "department"} onChange={() => setStateOption("department")} /> Department
                </label>
              </div> */}
            </div>
          )}

           {onboardMode === "location" && ( 
          
            <div className="form-row location-row">
              <div className="form-field inline">
                <label htmlFor="division">Division</label>
                <select id="division" name="division" value={formData.division} 
                 onChange={handleChange} 
                disabled={!formData.state || loadingDivisions}>
                  <option value="">{loadingDivisions ? "Loading..." : "Select Division"}</option>
                  {renderOptions(divisions, "division_code", "division_name")}
                </select>
              </div>

              <div className="form-field inline">
                <label htmlFor="district">District</label>
                <select id="district" name="district" value={formData.district} 
                 onChange={handleChange} 
                disabled={!formData.division || loadingDistricts}>
                  <option value="">{loadingDistricts ? "Loading..." : "Select District"}</option>
                  {renderOptions(districts, "district_code", "district_name")}
                </select>
              </div>

              <div className="form-field inline">
                <label htmlFor="taluka">Taluka</label>
                <select id="taluka" name="taluka" value={formData.taluka} 
                 onChange={handleChange}
                 disabled={!formData.district || loadingTalukas}>
                  <option value="">{loadingTalukas ? "Loading..." : "Select Taluka"}</option>
                  {renderOptions(talukas, "taluka_code", "taluka_name")}
                </select>
              </div>
            </div>
           )} 

          {onboardMode === "location" && stateOption === "department" && (
            <div className="form-field full">
              <label htmlFor="department">Department <span className="required">*</span></label>
              <select id="department" name="department" value={formData.department} 
            //   onChange={handleChange} 
              disabled={!formData.state || loadingDepartment}>
                <option value="">{loadingDepartment ? "Loading..." : "Select Department"}</option>
                {renderOptions(departments, "dept_code", "dept_name")}
              </select>
            </div>
          )}

          {/* Ministry flow */}
          {onboardMode === "ministry" && (
            <div className="form-field full">
              <label htmlFor="ministry">Ministry <span className="required">*</span></label>
              <select id="ministry" name="ministry" value={formData.ministry} 
            //   onChange={handleChange}
              >
                <option value="">{loadingMinistry ? "Loading..." : "Select Ministry"}</option>
                {renderOptions(ministry, "ministry_code", "ministry_name")}
              </select>
            </div>
          )}

          {/* Submit Button */}
          <div className="form-field full">
            <button type="submit" className="submit-btn">{submitting ? "Submitting..." : "Sign Up"}</button>
          </div>
        </form>
      </main>

      <footer className="footer">
        <img src="/ashok-chakra.png" alt="Ashok Chakra" className="chakra" />
      </footer>
    </div>
  );
}




// import React, { useEffect, useState, useCallback, useMemo } from "react";
// import { useNavigate, Link } from "react-router-dom";
// import { toast } from "react-toastify";
// import SHA256 from "crypto-js/sha256";
// import {
//   getStates,
//   getDivisions,
//   getDistricts,
//   getTalukas,
//   submitSignup,
// } from "../services/api";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faUniversalAccess } from "@fortawesome/free-solid-svg-icons";
// import logo from "../assets/emblem.png";
// import "../css/Signup.css";

// export default function SignUp() {
//   const navigate = useNavigate();

//   const [formData, setFormData] = useState({
//     full_name: "",
//     email_id: "",
//     mobile_no: "",
//     gender: "",
//     dob: "",
//     address: "",
//     pincode: "",
//     password: "",
//     confirmPassword: "",
//     photo: "",
//     state: "",
//     division: "",
//     district: "",
//     taluka: "",
//   });

//   const [states, setStates] = useState([]);
//   const [divisions, setDivisions] = useState([]);
//   const [districts, setDistricts] = useState([]);
//   const [talukas, setTalukas] = useState([]);
//   const [loadingStates, setLoadingStates] = useState(false);
//   const [loadingDivisions, setLoadingDivisions] = useState(false);
//   const [loadingDistricts, setLoadingDistricts] = useState(false);
//   const [loadingTalukas, setLoadingTalukas] = useState(false);
//   const [submitting, setSubmitting] = useState(false);

//   const [passwordMatch, setPasswordMatch] = useState(true);
//   const [passwordStrength, setPasswordStrength] = useState(true);
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirm, setShowConfirm] = useState(false);

//   const passwordRegex = /^(?=.[A-Z])(?=.\d)(?=.[!@#$%^&]).{8,}$/;

//   // Fetch helpers
//   const fetchDivisions = useCallback(async (stateCode) => {
//     if (!stateCode) return;
//     setLoadingDivisions(true);
//     const { data } = await getDivisions(stateCode);
//     setLoadingDivisions(false);
//     data ? setDivisions(data) : toast.error("Failed to load divisions.");
//   }, []);

//   const fetchDistricts = useCallback(async (stateCode, divisionCode) => {
//     if (!stateCode || !divisionCode) return;
//     setLoadingDistricts(true);
//     const { data } = await getDistricts(stateCode, divisionCode);
//     setLoadingDistricts(false);
//     data ? setDistricts(data) : toast.error("Failed to load districts.");
//   }, []);

//   const fetchTalukas = useCallback(async (stateCode, divisionCode, districtCode) => {
//     if (!stateCode || !divisionCode || !districtCode) return;
//     setLoadingTalukas(true);
//     const { data } = await getTalukas(stateCode, divisionCode, districtCode);
//     setLoadingTalukas(false);
//     data ? setTalukas(data) : toast.error("Failed to load talukas.");
//   }, []);

//   useEffect(() => {
//     (async () => {
//       setLoadingStates(true);
//       const { data } = await getStates();
//       setLoadingStates(false);
//       data ? setStates(data) : toast.error("Failed to load states.");
//     })();
//   }, []);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => {
//       const updated = { ...prev, [name]: value };

//       if (name === "password") {
//         setPasswordStrength(passwordRegex.test(value));
//         setPasswordMatch(value === prev.confirmPassword);
//       }
//       if (name === "confirmPassword") {
//         setPasswordMatch(prev.password === value);
//       }

//       // Reset dependent selects
//       if (name === "state") {
//         updated.division = updated.district = updated.taluka = "";
//         setDivisions([]);
//         setDistricts([]);
//         setTalukas([]);
//         if (value) fetchDivisions(value);
//       }
//       if (name === "division") {
//         updated.district = updated.taluka = "";
//         setDistricts([]);
//         setTalukas([]);
//         if (value) fetchDistricts(prev.state, value);
//       }
//       if (name === "district") {
//         updated.taluka = "";
//         setTalukas([]);
//         if (value) fetchTalukas(prev.state, prev.division, value);
//       }

//       return updated;
//     });
//   };

//   const isFormValid = useMemo(() => {
//     const { full_name, email_id, password, confirmPassword } = formData;
//     return !!full_name && !!email_id && !!password && !!confirmPassword && passwordMatch && passwordStrength && !submitting;
//   }, [formData, passwordMatch, passwordStrength, submitting]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!isFormValid) return toast.error("Please fill all required fields correctly.");
//     setSubmitting(true);

//     try {
//       const { confirmPassword, ...rest } = formData;
//       const payload = new FormData();

//       Object.keys(rest).forEach((key) => {
//         if (rest[key] !== null && rest[key] !== undefined) {
//           payload.append(key, rest[key]);
//         }
//       });

//       // Add username (email if exists, else mobile)
//       payload.append("username", formData.email_id || formData.mobile_no);

//       const response = await submitSignup(payload, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });

//       if (response.error) {
//         toast.error(response.error.response?.data?.error || "Signup failed.");
//       } else {
//         toast.success("Signup successful! Redirecting to login...", { autoClose: 2000 });
//         setTimeout(() => navigate("/"), 2000);
//         setFormData({
//           full_name: "",
//           email_id: "",
//           mobile_no: "",
//           gender: "",
//           dob: "",
//           address: "",
//           pincode: "",
//           password: "",
//           confirmPassword: "",
//           photo: "",
//           state: "",
//           division: "",
//           district: "",
//           taluka: "",
//         });
//       }
//     } catch (err) {
//       console.error("Signup error:", err);
//       toast.error("Signup failed. Please try again.");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const renderOptions = (list, keyField, labelField) =>
//     list.map((i) => (
//       <option key={i[keyField]} value={i[keyField]}>
//         {i[labelField]}
//       </option>
//     ));

//   return (
//     <div className="container">
//       <header className="header">
//         <div className="logo-group">
//           <Link to="/">
//             <img src={logo} alt="India Logo" className="logo" />
//           </Link>
//           <div className="gov-text">
//             <p className="hindi">महाराष्ट्र शासन</p>
//             <p className="english">Government of Maharashtra</p>
//           </div>
//         </div>
//         <div className="right-controls">
//           <span className="lang">अ/A</span>
//           <FontAwesomeIcon icon={faUniversalAccess} size="1x" className="access" />
//         </div>
//       </header>

//       <main className="login-box">
//         <h2 className="login-title">SignUp</h2>
//         <form className="form-grid form" onSubmit={handleSubmit}>

//           {/* Full Name */}
//           <div className="form-field inline">
//             <label>Full Name <span className="required">*</span></label>
//             <input name="full_name" value={formData.full_name} onChange={handleChange} required />
//           </div>

//           {/* Email & Mobile */}
//           <div className="form-row contact-row">
//             <div className="form-field inline">
//               <label>Email <span className="required">*</span></label>
//               <input type="email" name="email_id" value={formData.email_id} onChange={handleChange} required />
//             </div>
//             <div className="form-field inline">
//               <label>Mobile</label>
//               <input name="mobile_no" value={formData.mobile_no} onChange={handleChange} />
//             </div>
//           </div>

//           {/* Gender & DOB */}
//           <div className="form-row contact-row">
//             <div className="form-field inline">
//               <label>Gender</label>
//               <select name="gender" value={formData.gender} onChange={handleChange}>
//                 <option value="">Select Gender</option>
//                 <option value="M">Male</option>
//                 <option value="F">Female</option>
//                 <option value="O">Other</option>
//               </select>
//             </div>
//             <div className="form-field inline">
//               <label>Date of Birth</label>
//               <input type="date" name="dob" value={formData.dob} onChange={handleChange} />
//             </div>
//           </div>

//           {/* Address & Pincode */}
//           <div className="form-row contact-row">
//             <div className="form-field inline">
//               <label>Address</label>
//               <input name="address" value={formData.address} onChange={handleChange} />
//             </div>
//             <div className="form-field inline">
//               <label>Pincode</label>
//               <input name="pincode" value={formData.pincode} onChange={handleChange} />
//             </div>
//           </div>

//           {/* Password */}
//           <div className="form-row password-row">
//             {["password", "confirmPassword"].map((p) => (
//               <div className="form-field inline" key={p}>
//                 <label>{p === "password" ? "Password" : "Confirm Password"} <span className="required">*</span></label>
//                 <input
//                   type={p === "password" ? (showPassword ? "text" : "password") : showConfirm ? "text" : "password"}
//                   name={p}
//                   value={formData[p]}
//                   onChange={handleChange}
//                   required
//                 />
                
//               </div>
//             ))}
//           </div>

//           {!passwordStrength && <p className="error-text full">Password must be 8+ chars, include 1 uppercase, 1 number and 1 special character.</p>}
//           {!passwordMatch && <p className="error-text full">Passwords do not match.</p>}

//           {/* Photo Upload */}
//           <div className="form-field inline">
//             <label>Photo</label>
//             <input
//               type="file"
//               accept="image/*"
//               onChange={(e) => {
//                 const file = e.target.files[0];
//                 if (file && file.size <= 200 * 1024) {
//                   setFormData((prev) => ({ ...prev, photo: file }));
//                 } else {
//                   toast.error("File size exceeds 200 KB.");
//                 }
//               }}
//             />
//           </div>

//           {/* Location */}
//           <div className="form-row location-row">
//             <div className="form-field inline">
//               <label>State</label>
//               <select name="state" value={formData.state} onChange={handleChange}>
//                 <option value="">{loadingStates ? "Loading..." : "Select State"}</option>
//                 {renderOptions(states, "state_code", "state_name")}
//               </select>
//             </div>
//             <div className="form-field inline">
//               <label>Division</label>
//               <select name="division" value={formData.division} onChange={handleChange} disabled={!formData.state || loadingDivisions}>
//                 <option value="">{loadingDivisions ? "Loading..." : "Select Division"}</option>
//                 {renderOptions(divisions, "division_code", "division_name")}
//               </select>
//             </div>
//             <div className="form-field inline">
//               <label>District</label>
//               <select name="district" value={formData.district} onChange={handleChange} disabled={!formData.division || loadingDistricts}>
//                 <option value="">{loadingDistricts ? "Loading..." : "Select District"}</option>
//                 {renderOptions(districts, "district_code", "district_name")}
//               </select>
//             </div>
//             <div className="form-field inline">
//               <label>Taluka</label>
//               <select name="taluka" value={formData.taluka} onChange={handleChange} disabled={!formData.district || loadingTalukas}>
//                 <option value="">{loadingTalukas ? "Loading..." : "Select Taluka"}</option>
//                 {renderOptions(talukas, "taluka_code", "taluka_name")}
//               </select>
//             </div>
//           </div>

//           {/* Submit */}
//           <div className="form-field full">
//             <button type="submit" className="submit-btn">{submitting ? "Submitting..." : "Sign Up"}</button>
//           </div>
//         </form>
//       </main>

//       <footer className="footer">
//         <img src="/ashok-chakra.png" alt="Ashok Chakra" className="chakra" />
//       </footer>
//     </div>
//   );
// }