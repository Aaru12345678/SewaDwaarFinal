import React, { useState, useEffect, useCallback } from "react";
import Swal from "sweetalert2";
import { useNavigate, Link } from "react-router-dom";
import "../css/OfficerForm.css";
import {
  FaBuilding,
  FaCalendarAlt,
  FaUsers,
  FaChartBar,
  FaUserCog,
} from "react-icons/fa";
import {
  getStates,
  getDivisions,
  getDistricts,
  getTalukas,
  getOrganization,
  getDepartment,
  getDesignations,
  getRoles,
  registerUserByRole,
} from "../services/api";

/* ================= REGEX ================= */
const NAME_REGEX = /^[A-Za-z ]+$/;
const MOBILE_REGEX = /^[6-9]\d{9}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PINCODE_REGEX = /^[1-9][0-9]{5}$/;
const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;
const MAX_PHOTO_SIZE = 200 * 1024; // 200 KB
const ALLOWED_PHOTO_TYPES = ["image/jpeg", "image/jpg"];

export default function OfficerForm() {
  const navigate = useNavigate();

  /* ================= STATE ================= */
  const [form, setForm] = useState({
    full_name: "",
    gender: "",
    mobile_no: "",
    email_id: "",
    role_code: "",
    designation_code: "",
    organization_id: "",
    department_id: "",
    password: "",
    confirmPassword: "",
    officer_address: "",
    officer_state_code: "",
    officer_district_code: "",
    officer_division_code: "",
    officer_taluka_code: "",
    officer_pincode: "",
    photo: null,
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const [states, setStates] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [talukas, setTalukas] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [roles, setRoles] = useState([]);

  /* ================= LOAD MASTER DATA ================= */
  useEffect(() => {
    (async () => {
      setStates((await getStates()).data || []);
      setOrganizations((await getOrganization()).data || []);
      setDesignations((await getDesignations()).data || []);
      setRoles((await getRoles()).data?.roles || []);
    })();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  /* ================= CASCADING ================= */
  const fetchDivisions = useCallback(async (state) => {
    setDivisions((await getDivisions(state)).data || []);
  }, []);

  const fetchDistricts = useCallback(async (state, division) => {
    setDistricts((await getDistricts(state, division)).data || []);
  }, []);

  const fetchTalukas = useCallback(async (state, division, district) => {
    setTalukas((await getTalukas(state, division, district)).data || []);
  }, []);

  const fetchDepartments = useCallback(async (org) => {
    setDepartments((await getDepartment(org)).data || []);
  }, []);

  /* ================= FIELD VALIDATION ================= */
  const validateField = (name, value) => {
    let error = "";

    switch (name) {
      case "full_name":
        if (!value) error = "Full name is required";
        else if (!NAME_REGEX.test(value)) error = "Only alphabets allowed";
        break;

      case "officer_pincode":
  if (!value) {
    error = "Pincode is required";
  } else if (!PINCODE_REGEX.test(value)) {
    error = "Pincode must be a valid 6-digit number";
  }
  break;

      case "mobile_no":
        if (!value) error = "Mobile number is required";
        else if (!MOBILE_REGEX.test(value))
          error = "Mobile must start with 6/7/8/9 and be 10 digits";
        break;

      case "email_id":
        if (!value) error = "Email is required";
        else if (!EMAIL_REGEX.test(value)) error = "Invalid email format";
        break;

      case "gender":
        if (!value) error = "Gender is required";
        break;

      case "role_code":
        if (!value) error = "Role is required";
        break;

      case "designation_code":
        if (!value) error = "Designation is required";
        break;

      case "organization_id":
        if (!value) error = "Organization is required";
        break;

      case "department_id":
        if (!value) error = "Department is required";
        break;

      case "password":
        if (!PASSWORD_REGEX.test(value))
          error =
            "Password must contain at least 8 chars, 1 uppercase, 1 number & 1 special char";
        break;

      case "confirmPassword":
        if (value !== form.password) error = "Passwords do not match";
        break;
      
        case "photo":
  if (value) {
    if (!ALLOWED_PHOTO_TYPES.includes(value.type)) {
      error = "Only JPG/JPEG images are allowed";
    } else if (value.size > MAX_PHOTO_SIZE) {
      error = "Photo size must be less than 200 KB";
    }
  }
  break;

      default:
        break;
    }

    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  /* ================= CHANGE ================= */
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "photo") {
  const file = files[0];

  if (!file) {
    setForm((prev) => ({ ...prev, photo: null }));
    setErrors((prev) => ({ ...prev, photo: "" }));
    return;
  }

  // Validate type
  if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
    setErrors((prev) => ({
      ...prev,
      photo: "Only JPG/JPEG images are allowed",
    }));
    return;
  }

  // Validate size
  if (file.size > MAX_PHOTO_SIZE) {
    setErrors((prev) => ({
      ...prev,
      photo: "Photo size must be less than 200 KB",
    }));
    return;
  }

  // ✅ Valid photo
  setErrors((prev) => ({ ...prev, photo: "" }));
  setForm((prev) => ({ ...prev, photo: file }));
  return;
}


    setForm((prev) => ({ ...prev, [name]: value }));
    validateField(name, value);

    if (name === "officer_state_code") {
      fetchDivisions(value);
      setForm((f) => ({
        ...f,
        officer_state_code: value,
        officer_division_code: "",
        officer_district_code: "",
        officer_taluka_code: "",
      }));
    }

    if (name === "division_code") {
      fetchDistricts(form.officer_state_code, value);
      setForm((f) => ({ ...f, officer_division_code: value }));
    }

    if (name === "district_code") {
      fetchTalukas(
        form.officer_state_code,
        form.officer_division_code,
        value
      );
      setForm((f) => ({ ...f, officer_district_code: value }));
    }

    if (name === "taluka_code") {
      setForm((f) => ({ ...f, officer_taluka_code: value }));
    }

    if (name === "organization_id") {
      fetchDepartments(value);
    }
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (errors.photo) {
  Swal.fire("Error", "Please upload a valid photo", "error");
  return;
}

    const requiredFields = [
      "full_name",
      "gender",
      "photo",
      "mobile_no",
      "email_id",
      "role_code",
      "officer_pincode",
      "designation_code",
      "organization_id",
      "department_id",
      "password",
      "confirmPassword",
    ];

    let hasError = false;
    let newErrors = {};

    requiredFields.forEach((field) => {
  const value = form[field];

  // 🔹 Special handling for photo
  if (field === "photo") {
    if (!value) {
      newErrors.photo = "Photo is required";
      hasError = true;
    }
    return;
  }

  // 🔹 Handle strings safely
  if (
    value === undefined ||
    value === null ||
    (typeof value === "string" && value.trim() === "")
  ) {
    newErrors[field] = "This field is required";
    hasError = true;
    return;
  }

  validateField(field, value);
  if (errors[field]) hasError = true;
});

    setErrors((prev) => ({ ...prev, ...newErrors }));

    if (hasError) {
      Swal.fire("Error", "Please fill all required fields correctly", "error");
      return;
    }

    setSubmitting(true);
    try {
      // Prepare FormData for file upload
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (value !== null && value !== undefined) formData.append(key, value);
      });

      const res = await registerUserByRole(formData);

      if (res?.data?.success !== true) {
        Swal.fire({
          icon: "error",
          title: "Registration Failed",
          text: res?.data?.message || "Unable to register officer",
          confirmButtonColor: "#c62828",
        });
        return;
      }

      Swal.fire({
        icon: "success",
        title: "Registration Successful",
        text: res?.data?.message || "Officer registered successfully",
        confirmButtonColor: "#1f4fa3",
      });

      navigate("/admin/departments");
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Server Error",
        text: err?.response?.data?.message || "Unable to register user",
        confirmButtonColor: "#c62828",
      });
    } finally {
      setSubmitting(false);
    }
  };

  /* ================= UI ================= */
  return (
    <div className="admin-layout">
      <aside className="sidebar">
        <h2 className="logo">ADMINISTRATIVE</h2>
        <ul>
          <li>
            <Link to="/admin/departments">
              <FaBuilding /> Departments & Officers
            </Link>
          </li>
          <li>
            <Link to="/admin/slot-config">
              <FaCalendarAlt /> Slot & Holiday Config
            </Link>
          </li>
          <li>
            <Link to="/admin/appointments">
              <FaUsers /> Appointments & Walk In Summary
            </Link>
          </li>
          <li>
            <Link to="/admin/analytics">
              <FaChartBar /> Analytics & Reports
            </Link>
          </li>
          <li>
            <Link to="/admin/user-roles">
              <FaUserCog /> User Roles & Access
            </Link>
          </li>
        </ul>
      </aside>

      <div className="main">
        <header className="topbar">
          <button className="back-btn" onClick={() => navigate(-1)}>
            ← Back
          </button>
          <div className="top-actions">
            <span>👤 Admin Profile</span>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </header>

        <div className="officer-form-container">
          <h2>Register Officer</h2>

          <form onSubmit={handleSubmit}>
            <h3>Officer Basic Info</h3>

            <label>Full Name *</label>
            <input
              name="full_name"
              value={form.full_name}
              onChange={handleChange}
            />
            <p className="error">{errors.full_name}</p>

            <label>Gender *</label>
            <select name="gender" value={form.gender} onChange={handleChange}>
              <option value="">Select</option>
              <option>Male</option>
              <option>Female</option>
              <option>Others</option>
            </select>
            <p className="error">{errors.gender}</p>

            <label>Mobile Number *</label>
            <input
              name="mobile_no"
              value={form.mobile_no}
              maxLength={10}
              onChange={handleChange}
            />
            <p className="error">{errors.mobile_no}</p>

            <label>Email ID *</label>
            <input name="email_id" value={form.email_id} onChange={handleChange} />
            <p className="error">{errors.email_id}</p>

            {/* Photo Upload */}
            <label>Photo</label>
            <input type="file" name="photo" accept="image/*" onChange={handleChange} />
            <p className="error">{errors.photo}</p>

            <h3>Address Details</h3>

            <label>State *</label>
            <select
              name="officer_state_code"
              value={form.officer_state_code}
              onChange={handleChange}
            >
              <option value="">Select State</option>
              {states.map((s) => (
                <option key={s.state_code} value={s.state_code}>
                  {s.state_name}
                </option>
              ))}
            </select>
            <p className="error">{errors.officer_state_code}</p>

            <label>Division</label>
            <select
              name="division_code"
              value={form.officer_division_code}
              onChange={handleChange}
              disabled={!form.officer_state_code}
            >
              <option value="">Select Division</option>
              {divisions.map((d) => (
                <option key={d.division_code} value={d.division_code}>
                  {d.division_name}
                </option>
              ))}
            </select>

            <label>District</label>
            <select
              name="district_code"
              value={form.officer_district_code}
              onChange={handleChange}
              disabled={!form.officer_division_code}
            >
              <option value="">Select District</option>
              {districts.map((d) => (
                <option key={d.district_code} value={d.district_code}>
                  {d.district_name}
                </option>
              ))}
            </select>

            <label>Taluka</label>
            <select
              name="taluka_code"
              value={form.officer_taluka_code}
              onChange={handleChange}
              disabled={!form.officer_district_code}
            >
              <option value="">Select Taluka</option>
              {talukas.map((t) => (
                <option key={t.taluka_code} value={t.taluka_code}>
                  {t.taluka_name}
                </option>
              ))}
            </select>

            <label>Address</label>
            <textarea
              name="officer_address"
              rows={3}
              value={form.officer_address}
              onChange={handleChange}
            />

            <label>Pincode</label>
            <input
  name="officer_pincode"
  value={form.officer_pincode}
  maxLength={6}
  onChange={(e) => {
  if (/^\d*$/.test(e.target.value)) {
    handleChange(e);
    validateField("officer_pincode", e.target.value);
  }

  }}
/>

            <p className="error">{errors.officer_pincode}</p>

            <h3>Office Details</h3>

            <label>Role *</label>
            <select name="role_code" value={form.role_code} onChange={handleChange}>
              <option value="">Select Role</option>
              {roles.map((r) => (
                <option key={r.role_code} value={r.role_code}>
                  {r.role_name}
                </option>
              ))}
            </select>
            <p className="error">{errors.role_code}</p>

            <label>Designation *</label>
            <select
              name="designation_code"
              value={form.designation_code}
              onChange={handleChange}
            >
              <option value="">Select Designation</option>
              {designations.map((d) => (
                <option key={d.designation_code} value={d.designation_code}>
                  {d.designation_name}
                </option>
              ))}
            </select>
            <p className="error">{errors.designation_code}</p>

            <label>Organization *</label>
            <select
              name="organization_id"
              value={form.organization_id}
              onChange={handleChange}
            >
              <option value="">Select Organization</option>
              {organizations.map((o) => (
                <option key={o.organization_id} value={o.organization_id}>
                  {o.organization_name}
                </option>
              ))}
            </select>
            <p className="error">{errors.organization_id}</p>

            <label>Department *</label>
            <select
              name="department_id"
              value={form.department_id}
              onChange={handleChange}
              disabled={!form.organization_id}
            >
              <option value="">Select Department</option>
              {departments.map((d) => (
                <option key={d.department_id} value={d.department_id}>
                  {d.department_name}
                </option>
              ))}
            </select>
            <p className="error">{errors.department_id}</p>

            <h3>Password Details</h3>

            <label>Password *</label>
            <input type="password" name="password" onChange={handleChange} />
            <p className="error">{errors.password}</p>

            <label>Confirm Password *</label>
            <input
              type="password"
              name="confirmPassword"
              onChange={handleChange}
            />
            <p className="error">{errors.confirmPassword}</p>

            <button type="submit" disabled={submitting}>
              {submitting ? "Registering..." : "Register Officer"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
