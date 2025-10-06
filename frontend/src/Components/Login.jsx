import React, { useState, useCallback, useMemo, useRef } from "react"; 
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
 import { login } from "../services/api";
import CryptoJS from "crypto-js";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import "../css/Login.css";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// Import the specific icon
import { faUniversalAccess } from '@fortawesome/free-solid-svg-icons';

import logo from "../assets/emblem.png"
export default function Login() {
  const navigate = useNavigate();
  const boxRef = useRef(null);

  const [emailOrMobile, setEmailOrMobile] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(false);
  const[user_id,setUser_id]=useState("");
  const [superUserMode, setSuperUserMode] = useState(false);
  const [missingFields, setMissingFields] = useState({});
  const [userCode, setUserCode] = useState(null);

  const isDisabled = useMemo(
    () =>
      !user_id.trim() ||
      !password.trim() ||
      loading ||
      (superUserMode &&
        Object.values(missingFields).some((v) => !v || !v.trim())),
    [user_id, password, loading, superUserMode, missingFields]
  );

  // const handleSubmit = useCallback(
  //   async (e) => {
  //     e.preventDefault();
  //     setLoading(true);
  //     setProgress(true);

  //     try {
  //       const hashedPassword = CryptoJS.SHA256(password).toString();

  //       const credentials = {
  //         user_name: emailOrMobile,
  //         password: hashedPassword,
  //       };

  //       const { data, error } = await login(credentials);

  //       if (error) {
  //         toast.error(error.message || "Invalid credentials");
  //         if (boxRef.current) {
  //           boxRef.current.classList.add("shake");
  //           setTimeout(() => {
  //             boxRef.current.classList.remove("shake");
  //           }, 300);
  //         }
  //         return;
  //       }
  //       localStorage.setItem("token", data.token);
  //       localStorage.setItem("state_code", data.state_code || "");
  //       localStorage.setItem("division_code", data.division_code || "");
  //       localStorage.setItem("district_code", data.district_code || "");
  //       localStorage.setItem("taluka_code", data.taluka_code || "");
  //       localStorage.setItem("force_password_change", data.force_password_change);

  //       // Check for superuser missing fields
  //       if (data.missing_fields && data.missing_fields.length > 0) {
  //         const fieldsObj = data.missing_fields.reduce((acc, f) => {
  //           acc[f] = "";
  //           return acc;
  //         }, {});
  //         setMissingFields(fieldsObj);
  //         setUserCode(data.user_code);
  //         setSuperUserMode(true);
  //         toast.info("Please fill the missing fields to continue.");
  //         return;
  //       }

  //       // Normal login flow
        

  //       if (data.force_password_change) {
  //         toast.info("First login detected. Please change your password.");
  //         navigate("/change-password");
  //         return;
  //       }

  //       toast.success("Login successful 🎉");
  //       // setTimeout(() => navigate("/dashboard"), 800);
  //       navigate("/dashboard");
  //     } catch (err) {
  //       console.error(err);
  //       toast.error("Something went wrong, try again.");
  //     } finally {
  //       setLoading(false);
  //       setTimeout(() => setProgress(false), 400);
  //     }
  //   },
  //   [emailOrMobile, password, navigate, missingFields, superUserMode]
  // );

//  const handleSuperUserSubmit = async () => {
//   setLoading(true);
//   try {
//     const { data, error } = await updateSuperUserInfo({
//       user_code: userCode,
//       ...missingFields,
//     });

//     if (error) {
//       toast.error(error.message || "Failed to update profile. Try again.");
//       return;
//     }

//     toast.success("Profile updated successfully. Logging in...");
//     setSuperUserMode(false);
//     setMissingFields({});
//     setPassword(""); // force re-login if needed
//   } catch (err) {
//     console.error(err);
//     toast.error("Something went wrong. Try again.");
//   } finally {
//     setLoading(false);
//   }
// };

const handleSubmit = async (e) => {
  e.preventDefault();

  if (!user_id || !password) {
    toast.error("Please enter user ID and password");
    return;
  }

  setLoading(true);
  setProgress(true);

  try {
    // Payload matches backend expectation
    const payload = {
      user_id,  // This is the login identifier
      password,
    };

    const { data } = await login(payload); // your API call function

    if (!data.success) {
      toast.error(data.message || "Invalid credentials");

      if (boxRef.current) {
        boxRef.current.classList.add("shake");
        setTimeout(() => boxRef.current.classList.remove("shake"), 300);
      }
      return;
    }

    // Save user info
    localStorage.setItem("user_id", data.user_id);
    localStorage.setItem("role_code", data.role || "");

    toast.success("Login successful 🎉");
    navigate("/dashboard1");

  } catch (err) {
    console.error("Login error:", err);
    toast.error("Something went wrong, try again.");
  } finally {
    setLoading(false);
    setTimeout(() => setProgress(false), 400);
  }
};


  return (
    <div className="container">
      {progress && <div className="progress-bar"></div>}

      <div className="header">
        <div className="logo-group">
<Link to="/">
  <img src={logo} alt="India Logo" className="logo" />
</Link>          <div className="gov-text">
            <p className="hindi">महाराष्ट्र शासन</p>
            <p className="english">Government of Maharashtra</p>
          </div>
        </div>
        <div className="right-controls">
          <span className="lang">अ/A</span>

          {/* <span className="lang">अ</span>
          <span className="lang">A</span> */}
           <FontAwesomeIcon icon={faUniversalAccess} size="1x" className='access'/>

          {/* <span className="access">🔘</span> */}
        </div>
      </div>

      <div ref={boxRef} className="login-box">
        <h2 className="login-title">
          {superUserMode ? "Complete Superuser Profile" : "Login"}
        </h2>

        <form className="form" 
         onSubmit={superUserMode ? (e) => e.preventDefault() : handleSubmit}
        >
          {!superUserMode && (
            <>
              <label>
                UserId<span className="required">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter User Id"
                value={user_id}
                onChange={(e) => setUser_id(e.target.value)}
                required
              />

              <label>
                Password<span className="required">*</span>
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ paddingRight: "35px" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    color: "#555",
                  }}
                >
                  {showPass ? <AiOutlineEye /> : <AiOutlineEyeInvisible />}
                </button>
              </div>

<Link to="/forgot" className="forgot">Forgot your password?</Link>
            </>
          )}

          {superUserMode &&
            Object.keys(missingFields).map((field) => (
              <div key={field}>
                <label>
                  {field.replace("_", " ").toUpperCase()}
                  <span className="required">*</span>
                </label>
                <input
                  type={field.includes("email") ? "email" : "text"}
                  value={missingFields[field]}
                  onChange={(e) =>
                    setMissingFields((prev) => ({ ...prev, [field]: e.target.value }))
                  }
                  required
                />
              </div>
            ))}

          <button
            type={superUserMode ? "button" : "submit"}
            className="submit-btn"
            disabled={isDisabled}
            // onClick={superUserMode ? handleSuperUserSubmit : undefined}
          >
            {loading ? "Processing..." : superUserMode ? "Update Profile" : "Login"}
          </button>

          {!superUserMode && (
            <div className="signup-link">
              <p>
                Don’t have an account?{" "}
                <span
                  className="create-link"
                  onClick={() => navigate("/signup")}
                  style={{
                    color: "#007bff",
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                >
                  Create one
                </span>
              </p>
            </div>
          )}
        </form>
      </div>

      <div className="footer">
        <img src="/ashok-chakra.png" alt="Ashok Chakra" className="chakra" />
      </div>
    </div>
  );
}
