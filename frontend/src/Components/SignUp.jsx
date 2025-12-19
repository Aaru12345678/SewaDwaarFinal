import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "../css/Signup.css";

import {
  getStates,
  getDivisions,
  getDistricts,
  getTalukas,
  submitSignup,
} from "../services/api";

import SewadwaarLogo1 from "../assets/SewadwaarLogo1.png";
import nicLogo from "../assets/nic-logo.png";
import digitalIndiaLogo from "../assets/digital_india.png";
import logo from "../assets/emblem.png";

export default function SignUp() {
  const navigate = useNavigate();

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

  const [is18, setIs18] = useState(true);
  const [states, setStates] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [talukas, setTalukas] = useState([]);

  const onboardMode = "location";

  const [passwordMatch, setPasswordMatch] = useState(true);
  const [passwordStrength, setPasswordStrength] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingDivisions, setLoadingDivisions] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingTalukas, setLoadingTalukas] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;

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

  const fetchTalukas = useCallback(
    async (stateCode, divisionCode, districtCode) => {
      if (!stateCode || !divisionCode || !districtCode) return;
      setLoadingTalukas(true);
      const { data } = await getTalukas(stateCode, divisionCode, districtCode);
      setLoadingTalukas(false);
      data ? setTalukas(data) : toast.error("Failed to load talukas.");
    },
    []
  );

  useEffect(() => {
    (async () => {
      setLoadingStates(true);
      const { data } = await getStates();
      setLoadingStates(false);
      data ? setStates(data) : toast.error("Failed to load states.");
    })();
  }, []);

  const validateAge = (dobValue) => {
    if (!dobValue) {
      setIs18(true);
      return true;
    }

    const dobDate = new Date(dobValue);
    const today = new Date();

    let age = today.getFullYear() - dobDate.getFullYear();
    const m = today.getMonth() - dobDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dobDate.getDate())) {
      age--;
    }

    const valid = age >= 18;
    setIs18(valid);
    return valid;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const updated = { ...prev, [name]: value };

      if (name === "dob") {
        validateAge(value);
      }

      if (name === "password") {
        setPasswordStrength(passwordRegex.test(value));
        setPasswordMatch(value === prev.confirmPassword);
      }

      if (name === "confirmPassword") {
        setPasswordMatch(prev.password === value);
      }

      if (name === "state") {
        updated.division = "";
        updated.district = "";
        updated.taluka = "";
        setDivisions([]);
        setDistricts([]);
        setTalukas([]);
        if (value) fetchDivisions(value);
      }

      if (name === "division") {
        updated.district = "";
        updated.taluka = "";
        setDistricts([]);
        setTalukas([]);
        if (value) fetchDistricts(prev.state, value);
      }

      if (name === "district") {
        updated.taluka = "";
        setTalukas([]);
        if (value) fetchTalukas(prev.state, prev.division, value);
      }

      return updated;
    });
  };

  const isFormValid = useMemo(() => {
    const { full_name, email_id, password, confirmPassword, dob } = formData;

    return (
      !!full_name &&
      !!email_id &&
      !!password &&
      !!confirmPassword &&
      !!dob &&
      passwordMatch &&
      passwordStrength &&
      is18 &&
      !submitting
    );
  }, [formData, passwordMatch, passwordStrength, is18, submitting]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.dob) {
      return toast.error("Please select your Date of Birth.");
    }

    if (!is18) {
      return toast.error("You must be 18 or older to sign up.");
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

      if (formData.photo) {
        payload.append("photo", formData.photo);
      }

      const response = await submitSignup(payload);

      if (response.error) {
        const backendMsg =
          response.error.response?.data?.message ||
          response.error.response?.data?.error;
        toast.error(backendMsg || "Signup failed.");
      } else {
        toast.success("Signup successful! Redirecting...", {
          autoClose: 2000,
        });
        setTimeout(() => navigate("/login/visitorlogin"), 2000);
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
    <div className="signup-page">

      {/* ▬▬▬▬▬ GOVERNMENT HEADER ▬▬▬▬ */}
      <header className="gov-header">
        <div className="gov-left">
          <img src={logo} alt="Emblem" className="gov-emblem" />
          <div className="gov-text">
            <span className="gov-hi">महाराष्ट्र शासन</span>
            <span className="gov-en">Government of Maharashtra</span>
          </div>
        </div>

        <div className="gov-right">
          <span className="gov-font">अ/A</span>
          <span className="gov-access">🛗</span>
        </div>
      </header>

      {/* ===== SIGNUP CARD ===== */}
      <main className="login-box">
        <div className="login-header-row">
          <div className="login-header-main">
            <h2 className="login-title">Sign Up</h2>
            <p className="login-subtitle">
              Create your visitor account to access government offices securely.
            </p>
          </div>
          <div className="step-chip">Step 1 of 1 · Registration</div>
        </div>

        <form className="form" onSubmit={handleSubmit}>
          
          {/* Full Name */}
          <div className="form-field full">
            <label htmlFor="full_name">
              Full Name <span className="required">*</span>
            </label>
            <input
              id="full_name"
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              required
            />
          </div>

          {/* Email & Mobile */}
          <div className="form-row contact-row">
            <div className="form-field">
              <label htmlFor="email_id">
                Email <span className="required">*</span>
              </label>
              <input
                id="email_id"
                type="email"
                name="email_id"
                value={formData.email_id}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="mobile_no">
                Mobile <span className="required">*</span>
              </label>
              <input
                id="mobile_no"
                name="mobile_no"
                value={formData.mobile_no}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Gender & DOB */}
          <div className="form-row contact-row">
            <div className="form-field">
              <label htmlFor="gender">
                Gender <span className="required">*</span>
              </label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="dob">
                Date Of Birth <span className="required">*</span>
              </label>
              <input
                id="dob"
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                required
              />
              {!is18 && <p className="error-text">You must be 18 or older.</p>}
            </div>
          </div>

          {/* Address */}
          <div className="form-field full">
            <label htmlFor="address">
              Address <span className="required">*</span>
            </label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows="3"
              required
            />
          </div>

          {/* Pincode */}
          <div className="form-row contact-row">
            <div className="form-field">
              <label htmlFor="pincode">
                PinCode <span className="required">*</span>
              </label>
              <input
                id="pincode"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Location */}
          {onboardMode === "location" && (
            <>
              <div className="form-field full">
                <label htmlFor="state">
                  State <span className="required">*</span>
                </label>
                <select
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  required
                >
                  <option value="">
                    {loadingStates ? "Loading..." : "Select State"}
                  </option>
                  {renderOptions(states, "state_code", "state_name")}
                </select>
              </div>

              <div className="form-row location-row">
                <div className="form-field">
                  <label htmlFor="division">Division</label>
                  <select
                    id="division"
                    name="division"
                    value={formData.division}
                    onChange={handleChange}
                    disabled={!formData.state || loadingDivisions}
                  >
                    <option value="">
                      {loadingDivisions ? "Loading..." : "Select Division"}
                    </option>
                    {renderOptions(
                      divisions,
                      "division_code",
                      "division_name"
                    )}
                  </select>
                </div>

                <div className="form-field">
                  <label htmlFor="district">District</label>
                  <select
                    id="district"
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    disabled={!formData.division || loadingDistricts}
                  >
                    <option value="">
                      {loadingDistricts ? "Loading..." : "Select District"}
                    </option>
                    {renderOptions(
                      districts,
                      "district_code",
                      "district_name"
                    )}
                  </select>
                </div>

                <div className="form-field">
                  <label htmlFor="taluka">Taluka</label>
                  <select
                    id="taluka"
                    name="taluka"
                    value={formData.taluka}
                    onChange={handleChange}
                    disabled={!formData.district || loadingTalukas}
                  >
                    <option value="">
                      {loadingTalukas ? "Loading..." : "Select Taluka"}
                    </option>
                    {renderOptions(talukas, "taluka_code", "taluka_name")}
                  </select>
                </div>
              </div>
            </>
          )}

          {/* Password */}
          <div className="form-row password-row">
            {["password", "confirmPassword"].map((p) => (
              <div className="form-field" key={p}>
                <label htmlFor={p}>
                  {p === "password" ? "Password" : "Confirm Password"}{" "}
                  <span className="required">*</span>
                </label>
                <div className="password-wrap">
                  <input
                    id={p}
                    type={
                      p === "password"
                        ? showPassword
                          ? "text"
                          : "password"
                        : showConfirm
                        ? "text"
                        : "password"
                    }
                    name={p}
                    value={formData[p]}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    className="eye-btn"
                    onClick={() =>
                      p === "password"
                        ? setShowPassword((s) => !s)
                        : setShowConfirm((s) => !s)
                    }
                  >
                    {p === "password"
                      ? showPassword
                        ? "🔓"
                        : "🔒"
                      : showConfirm
                      ? "🔓"
                      : "🔒"}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {!passwordStrength && (
            <p className="error-text full">
              Password must be 8+ chars, include 1 uppercase, 1 number & 1
              special character.
            </p>
          )}

          {!passwordMatch && (
            <p className="error-text full">Passwords do not match.</p>
          )}

          {/* Photo */}
          <div className="form-field full">
            <label htmlFor="photo">
              Photo <span className="required">*</span>
            </label>
            <input
              type="file"
              id="photo"
              name="photo"
              accept="image/*"
              onChange={(e) =>
                setFormData({ ...formData, photo: e.target.files[0] })
              }
            />
          </div>

          {/* Submit */}
          <div className="form-field full">
            <button
              type="submit"
              className="submit-btn"
              disabled={submitting || !isFormValid}
            >
              {submitting ? "Submitting..." : "Sign Up"}
            </button>
          </div>
        </form>
      </main>

{/* ===== FULL GOV FOOTER (SEWADWAAR STYLE) ===== */}
<footer className="full-footer">
  
  <div className="footer-section footer-about">
    <img src={SewadwaarLogo1} alt="SewaDwaar" className="footer-logo" />
    <p className="footer-desc">
      SewaDwaar is an initiative by the Government of Maharashtra to enable citizens 
      to conveniently book appointments and access government services seamlessly.
    </p>
  </div>

  <div className="footer-section">
    <h4>Important Links</h4>
    <a href="/login">Login</a>
  </div>

  <div className="footer-section">
    <h4>Quick Links</h4>
    <a href="/help">Help</a>
    <a href="/contact">Contact Us</a>
  </div>

  <div className="footer-section footer-logos">
    <img src={nicLogo} alt="NIC" className="nic-logo" />
    <img src={digitalIndiaLogo} alt="Digital India" className="digital-logo" />

    <p className="copyright">
      © {new Date().getFullYear()} SewaDwaar Initiative
    </p>
  </div>

</footer>

    </div>
  );
}
