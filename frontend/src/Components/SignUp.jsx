import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
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

  /* ===================== STATE ===================== */
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
    photo: null,
    state: "",
    division: "",
    district: "",
    taluka: "",
  });

  const [errors, setErrors] = useState({});
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
  const [showRegisterForm, setShowRegisterForm] = useState(false);


  /* ===================== REGEX ===================== */
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;
  const nameRegex = /^[A-Za-z\s]+$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const mobileRegex = /^[6-9]\d{9}$/;
  const pincodeRegex = /^\d{6}$/;

  /* ===================== FETCHERS ===================== */
  const fetchDivisions = useCallback(async (stateCode) => {
    if (!stateCode) return;
    setLoadingDivisions(true);
    const { data } = await getDivisions(stateCode);
    setLoadingDivisions(false);
    if (data) setDivisions(data);
  }, []);

  const fetchDistricts = useCallback(async (stateCode, divisionCode) => {
    if (!stateCode || !divisionCode) return;
    setLoadingDistricts(true);
    const { data } = await getDistricts(stateCode, divisionCode);
    setLoadingDistricts(false);
    if (data) setDistricts(data);
  }, []);

  const fetchTalukas = useCallback(async (stateCode, divisionCode, districtCode) => {
    if (!stateCode || !divisionCode || !districtCode) return;
    setLoadingTalukas(true);
    const { data } = await getTalukas(stateCode, divisionCode, districtCode);
    setLoadingTalukas(false);
    if (data) setTalukas(data);
  }, []);

  useEffect(() => {
  (async () => {
    setLoadingStates(true);
    try {
      const { data, error } = await getStates();
      setLoadingStates(false);

      if (error || !data) {
        Swal.fire(
          "Error",
          "Unable to load states. Please try again later.",
          "error"
        );
        return;
      }

      setStates(data);
    } catch (err) {
      setLoadingStates(false);
      Swal.fire(
        "Error",
        "Unable to load states due to server error.",
        "error"
      );
    }
  })();
}, []);

  /* ===================== AGE ===================== */
  const validateAge = (dobValue) => {
    const dobDate = new Date(dobValue);
    const today = new Date();
    let age = today.getFullYear() - dobDate.getFullYear();
    const m = today.getMonth() - dobDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dobDate.getDate())) age--;
    const valid = age >= 18;
    setIs18(valid);
    return valid;
  };

  /* ===================== HANDLE CHANGE ===================== */
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    setErrors((p) => ({ ...p, [name]: "" }));

    if (name === "photo") {
      const file = files[0];
      if (!file) return;

      if (!["image/jpeg", "image/jpg"].includes(file.type)) {
        setErrors((e) => ({ ...e, photo: "Only JPG/JPEG allowed." }));
        return;
      }
      if (file.size > 200 * 1024) {
        setErrors((e) => ({ ...e, photo: "Photo must be ≤ 200 KB." }));
        return;
      }
      setFormData((p) => ({ ...p, photo: file }));
      return;
    }

    setFormData((prev) => {
      const updated = { ...prev, [name]: value };

      if (name === "dob") validateAge(value);

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

    /* INLINE VALIDATION */
    if (name === "full_name" && !nameRegex.test(value)) {
      setErrors((e) => ({ ...e, full_name: "Only alphabets allowed." }));
    }
    if (name === "email_id" && !emailRegex.test(value)) {
      setErrors((e) => ({ ...e, email_id: "Invalid email format." }));
    }
    if (name === "mobile_no" && !mobileRegex.test(value)) {
  setErrors((e) => ({
    ...e,
    mobile_no: "Mobile number must start with 6–9 and be 10 digits.",
  }));
}
    if (name === "pincode" && !pincodeRegex.test(value)) {
      setErrors((e) => ({ ...e, pincode: "Pincode must be 6 digits." }));
    }
  };

  /* ===================== FORM VALID ===================== */
  const isFormValid = useMemo(() => {
    const required = [
      "full_name",
      "email_id",
      "mobile_no",
      "gender",
      "dob",
      "address",
      "pincode",
      "password",
      "confirmPassword",
      "photo",
      "state",
    ];
    return (
      required.every((f) => formData[f]) &&
      Object.values(errors).every((e) => !e) &&
      passwordMatch &&
      passwordStrength &&
      is18 &&
      !submitting
    );
  }, [formData, errors, passwordMatch, passwordStrength, is18, submitting]);

  /* ===================== SUBMIT ===================== */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid) {
      setErrors((e) => ({
        ...e,
        form: "Please correct the highlighted fields.",
      }));
      return;
    }

    setSubmitting(true);
    try {
      const { confirmPassword, ...rest } = formData;
      const payload = new FormData();
      Object.entries(rest).forEach(([k, v]) => payload.append(k, v));

      const response = await submitSignup(payload);

      if (response.error) {
        Swal.fire(
          "Signup Failed",
          response.error.response?.data?.message || "Signup failed.",
          "error"
        );
      } else {
        Swal.fire({
          icon: "success",
          title: "Signup Successful",
          text: "Redirecting to login...",
          timer: 2000,
          showConfirmButton: false,
        }).then(() => navigate("/login/visitorlogin"));
      }
    } finally {
      setSubmitting(false);
    }
  };

  /* ===================== RENDER OPTIONS ===================== */
  const renderOptions = (list, valueKey, labelKey) =>
    Array.isArray(list)
      ? list.map((item) => (
          <option key={item[valueKey]} value={item[valueKey]}>
            {item[labelKey]}
          </option>
        ))
      : null;
      
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
          <div className="signup-title-row">
  <span
    
  >
    <button className="back-btn" onClick={() => navigate(-1)}>
                ← Back
              </button>
  </span>
  <h2 className="login-title">Sign Up</h2>
</div>
          <p className="login-subtitle">
            Create your visitor account to access government offices securely.
          </p>
        </div>
        <div className="step-chip">Step 1 of 1 · Registration</div>
      </div>

      <form className="form" onSubmit={handleSubmit}>

        {/* Full Name */}
        <div className="form-field full">
          <label>
            Full Name <span className="required">*</span>
          </label>
          <input
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            required
          />
          {errors.full_name && (
            <p className="error-text">{errors.full_name}</p>
          )}
        </div>

        {/* Email & Mobile */}
        <div className="form-row contact-row">
          <div className="form-field">
            <label>
              Email <span className="required">*</span>
            </label>
            <input
              type="email"
              name="email_id"
              value={formData.email_id}
              onChange={handleChange}
              required
            />
            {errors.email_id && (
              <p className="error-text">{errors.email_id}</p>
            )}
          </div>

          <div className="form-field">
            <label>
              Mobile <span className="required">*</span>
            </label>
            <input
  name="mobile_no"
  value={formData.mobile_no}
  onChange={handleChange}
  maxLength={10}
  pattern="[6-9][0-9]{9}"
  inputMode="numeric"
  required
/>

            {errors.mobile_no && (
              <p className="error-text">{errors.mobile_no}</p>
            )}
          </div>
        </div>

        {/* Gender & DOB */}
        <div className="form-row contact-row">
          <div className="form-field">
            <label>
              Gender <span className="required">*</span>
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              required
            >
              <option value="">Select Gender</option>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </div>

          <div className="form-field">
            <label>
              Date Of Birth <span className="required">*</span>
            </label>
            <input
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              required
            />
            {!is18 && (
              <p className="error-text">You must be 18 or older.</p>
            )}
          </div>
        </div>

        {/* Address */}
        <div className="form-field full">
          <label>
            Address <span className="required">*</span>
          </label>
          <textarea
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
            <label>
              PinCode <span className="required">*</span>
            </label>
            <input
              name="pincode"
              value={formData.pincode}
              onChange={handleChange}
              required
            />
            {errors.pincode && (
              <p className="error-text">{errors.pincode}</p>
            )}
          </div>
        </div>

        {/* Location */}
        {onboardMode === "location" && (
          <>
            <div className="form-field full">
              <label>
                State <span className="required">*</span>
              </label>
              <select
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
                <label>Division</label>
                <select
                  name="division"
                  value={formData.division}
                  onChange={handleChange}
                  disabled={!formData.state || loadingDivisions}
                >
                  <option value="">
                    {loadingDivisions ? "Loading..." : "Select Division"}
                  </option>
                  {renderOptions(divisions, "division_code", "division_name")}
                </select>
              </div>

              <div className="form-field">
                <label>District</label>
                <select
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  disabled={!formData.division || loadingDistricts}
                >
                  <option value="">
                    {loadingDistricts ? "Loading..." : "Select District"}
                  </option>
                  {renderOptions(districts, "district_code", "district_name")}
                </select>
              </div>

              <div className="form-field">
                <label>Taluka</label>
                <select
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
              <label>
                {p === "password" ? "Password" : "Confirm Password"}{" "}
                <span className="required">*</span>
              </label>
              <div className="password-wrap">
                <input
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
            Password must be 8+ chars, include 1 uppercase, 1 number & 1 special
            character.
          </p>
        )}

        {!passwordMatch && (
          <p className="error-text full">Passwords do not match.</p>
        )}

        {/* Photo */}
        <div className="form-field full">
          <label>
            Photo <span className="required">*(Only JPG/JPEG allowed, max size 200KB)</span>
          </label>
          <input
            type="file"
            name="photo"
            accept="image/*"
            onChange={handleChange}
          />
          {errors.photo && (
            <p className="error-text">{errors.photo}</p>
          )}
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

    {/* ===== FULL GOV FOOTER (UNCHANGED) ===== */}
    <footer className="full-footer">
      <div className="footer-section footer-about">
        <img src={SewadwaarLogo1} alt="SewaDwaar" className="footer-logo" />
        <p className="footer-desc">
          SewaDwaar is an initiative by the Government of Maharashtra to enable
          citizens to conveniently book appointments and access government
          services seamlessly.
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
