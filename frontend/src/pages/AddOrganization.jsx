import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../css/AddOrganization.css";
import { Link } from "react-router-dom";
import {
  FaBuilding,
  FaCalendarAlt,
  FaUsers,
  FaChartBar,
  FaUserCog,
} from "react-icons/fa";
import Swal from "sweetalert2";

import {
  getStates,
  getDivisions,
  getDistricts,
  getTalukas,
} from "../services/api";

export default function AddOrganization() {
  const navigate = useNavigate();

  // ========= Masters =========
  const [states, setStates] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [talukas, setTalukas] = useState([]);

  // ========= Form =========
  const [form, setForm] = useState({
    organization_name: "",
    organization_name_ll: "",
    address_line: "",
    state_code: "",
    division_code: "",
    district_code: "",
    taluka_code: "",
    pincode: "",
  });

  const [departments, setDepartments] = useState([]);

  // ========= Errors =========
  const [errors, setErrors] = useState({
    organization_name: "",
    pincode: "",
    // Dynamic errors for dept/service names
    departments: [],
  });

  // ========= Utils =========
  const renderOptions = (list, valueKey, labelKey) =>
    Array.isArray(list)
      ? list.map((item) => (
          <option key={item[valueKey]} value={item[valueKey]}>
            {item[labelKey]}
          </option>
        ))
      : null;

  // ========= Input Validation =========
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Organization Name → alphabets + space only
    if (name === "organization_name") {
      const regex = /^[A-Za-z ]*$/;
      if (!regex.test(value)) {
        setErrors((er) => ({
          ...er,
          organization_name: "Only alphabets and spaces are allowed",
        }));
        return;
      } else {
        setErrors((er) => ({ ...er, organization_name: "" }));
      }
    }

    // Pincode → numeric, max 6 digits
    if (name === "pincode") {
      const regex = /^[0-9]{0,6}$/;
      if (!regex.test(value)) {
        setErrors((er) => ({
          ...er,
          pincode: "Only numeric digits allowed",
        }));
        return;
      } else if (value.length > 0 && value.length < 6) {
        setErrors((er) => ({
          ...er,
          pincode: "Pincode must be 6 digits",
        }));
      } else {
        setErrors((er) => ({ ...er, pincode: "" }));
      }
    }

    setForm({ ...form, [name]: value });
  };

const handleLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user_id");
  localStorage.removeItem("officer_id");
  localStorage.removeItem("role_code");
  localStorage.removeItem("username");

  navigate("/login");
};


  // ========= Load States =========
  useEffect(() => {
    (async () => {
      try {
        const res = await getStates();
        setStates(res.data || []);
      } catch (err) {
        console.error("Failed to load states", err);
      }
    })();
  }, []);

  // ========= Cascading Dropdowns =========
  useEffect(() => {
    if (!form.state_code) return;

    (async () => {
      const res = await getDivisions(form.state_code);
      setDivisions(res.data || []);
      setDistricts([]);
      setTalukas([]);
      setForm((f) => ({
        ...f,
        division_code: "",
        district_code: "",
        taluka_code: "",
      }));
    })();
  }, [form.state_code]);

  useEffect(() => {
    if (!form.state_code || !form.division_code) return;

    (async () => {
      const res = await getDistricts(form.state_code, form.division_code);
      setDistricts(res.data || []);
      setTalukas([]);
      setForm((f) => ({
        ...f,
        district_code: "",
        taluka_code: "",
      }));
    })();
  }, [form.state_code, form.division_code]);

  useEffect(() => {
    if (!form.state_code || !form.division_code || !form.district_code) return;

    (async () => {
      const res = await getTalukas(
        form.state_code,
        form.division_code,
        form.district_code
      );
      setTalukas(res.data || []);
      setForm((f) => ({ ...f, taluka_code: "" }));
    })();
  }, [form.state_code, form.division_code, form.district_code]);

  // ========= Departments =========
  const addDepartment = () => {
    setDepartments([
      ...departments,
      { dept_name: "", dept_name_ll: "", services: [], isOpen: true },
    ]);

    setErrors((er) => ({
      ...er,
      departments: [...(er.departments || []), { dept_name: "", services: [] }],
    }));
  };

  const toggleDept = (i) => {
    const d = [...departments];
    d[i].isOpen = !d[i].isOpen;
    setDepartments(d);
  };

  const handleDeptChange = (i, field, val) => {
    const d = [...departments];
    d[i][field] = val;
    setDepartments(d);

    // Dept name validation
    if (field === "dept_name") {
      const regex = /^[A-Za-z ]*$/;
      const newDeptErrors = [...errors.departments];
      if (!regex.test(val)) {
        newDeptErrors[i] = { ...newDeptErrors[i], dept_name: "Only alphabets and spaces are allowed" };
      } else {
        newDeptErrors[i] = { ...newDeptErrors[i], dept_name: "" };
      }
      setErrors((er) => ({ ...er, departments: newDeptErrors }));
    }
  };

  const removeDepartment = (i) => {
    const d = [...departments];
    d.splice(i, 1);
    setDepartments(d);

    const depErrors = [...errors.departments];
    depErrors.splice(i, 1);
    setErrors((er) => ({ ...er, departments: depErrors }));
  };

  // ========= Services =========
  const addService = (di) => {
    const d = [...departments];
    d[di].services.push({ name: "", name_ll: "", isOpen: true });
    setDepartments(d);

    const depErrors = [...errors.departments];
    depErrors[di].services.push({ name: "" });
    setErrors((er) => ({ ...er, departments: depErrors }));
  };

  const toggleService = (di, si) => {
    const d = [...departments];
    d[di].services[si].isOpen = !d[di].services[si].isOpen;
    setDepartments(d);
  };

  const handleServiceChange = (di, si, field, val) => {
    const d = [...departments];
    d[di].services[si][field] = val;
    setDepartments(d);

    // Service name validation
    if (field === "name") {
      const regex = /^[A-Za-z ]*$/;
      const depErrors = [...errors.departments];
      if (!depErrors[di]) depErrors[di] = { dept_name: "", services: [] };
      if (!depErrors[di].services) depErrors[di].services = [];
      if (!regex.test(val)) {
        depErrors[di].services[si] = { name: "Only alphabets and spaces are allowed" };
      } else {
        depErrors[di].services[si] = { name: "" };
      }
      setErrors((er) => ({ ...er, departments: depErrors }));
    }
  };

  const removeService = (di, si) => {
    const d = [...departments];
    d[di].services.splice(si, 1);
    setDepartments(d);

    const depErrors = [...errors.departments];
    if (depErrors[di]?.services) depErrors[di].services.splice(si, 1);
    setErrors((er) => ({ ...er, departments: depErrors }));
  };

  // ========= Submit =========
  const handleSubmit = async (e) => {
  e.preventDefault();

  // Validation
  if (
    !form.organization_name ||
    !form.state_code ||
    !form.address_line ||
    !form.pincode ||
    form.pincode.length !== 6 ||
    errors.organization_name ||
    errors.pincode
  ) {
    Swal.fire({
      icon: "warning",
      title: "Validation Error",
      text: "Please fix validation errors before submitting!",
      confirmButtonColor: "#1f4fa3",
    });
    return;
  }

  // Dept / Service validation
  const deptErrors = errors.departments || [];
  for (let i = 0; i < deptErrors.length; i++) {
    if (deptErrors[i]?.dept_name) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Department Name",
        text: `Fix Department #${i + 1} name error`,
        confirmButtonColor: "#1f4fa3",
      });
      return;
    }

    for (let j = 0; j < (deptErrors[i]?.services?.length || 0); j++) {
      if (deptErrors[i].services[j]?.name) {
        Swal.fire({
          icon: "warning",
          title: "Invalid Service Name",
          text: `Fix Service #${j + 1} of Department #${i + 1}`,
          confirmButtonColor: "#1f4fa3",
        });
        return;
      }
    }
  }

  const payload = { ...form, departments };

  try {
    await fetch("http://localhost:5000/api/organization", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    // ✅ SUCCESS ALERT
    Swal.fire({
      icon: "success",
      title: "Organization Added",
      text: "Government organization registered successfully.",
      confirmButtonText: "OK",
      confirmButtonColor: "#1f4fa3",
    }).then(() => {
      navigate("/admin/departments");
    });

  } catch (err) {
    console.error(err);

    // ❌ ERROR ALERT
    Swal.fire({
      icon: "error",
      title: "Submission Failed",
      text: "Unable to save organization. Please try again later.",
      confirmButtonColor: "#c62828",
    });
  }
};


  // ========= UI =========
 return (
  <div className="admin-layout">
    {/* ===== SIDEBAR ===== */}
    <aside className="sidebar">
      <h2 className="logo">ADMINISTRATIVE</h2>
      <ul>
        <li><Link to="/admin/departments"><FaBuilding /> Departments & Officers</Link></li>
        <li><Link to="/admin/slot-config"><FaCalendarAlt /> Slot & Holiday Config</Link></li>
        <li><Link to="/admin/appointments"><FaUsers /> Appointments & Walk In Summary</Link></li>
        <li><Link to="/admin/analytics"><FaChartBar /> Analytics & Reports</Link></li>
        <li><Link to="/admin/user-roles"><FaUserCog /> User Roles & Access</Link></li>
      </ul>
    </aside>

    {/* ===== MAIN ===== */}
    <div className="main">
      {/* TOPBAR */}
      <header className="topbar">
        <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
        <div className="top-actions">
          <span>👤 Admin Profile</span>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      {/* ===== PAGE BODY ===== */}
      <div className="org-page">
        <div className="org-card wide">

          {/* HEADER */}
          <div className="org-header">
            <h1>Register Government Organization</h1>
            <p>Administrative Onboarding Form</p>
          </div>

          <form onSubmit={handleSubmit}>

            {/* ===== BASIC INFO ===== */}
            <div className="org-section">
              <h3>1. Basic Information</h3>

              <label>Organization Name *</label>
              <input name="organization_name" value={form.organization_name} onChange={handleChange} />

              <label>Organization Name (Local Language)</label>
              <input name="organization_name_ll" value={form.organization_name_ll} onChange={handleChange} />
            </div>

            {/* ===== ADDRESS ===== */}
            <div className="org-section">
              <h3>2. Address Details</h3>

              <label>Address *</label>
              <textarea name="address_line" rows="3" value={form.address_line} onChange={handleChange} />

              <div className="grid-2">
                <div>
                  <label>State *</label>
                  <select name="state_code" value={form.state_code} onChange={handleChange}>
                    <option value="">Select State</option>
                    {renderOptions(states, "state_code", "state_name")}
                  </select>
                </div>

                <div>
                  <label>Pincode *</label>
                  <input name="pincode" value={form.pincode} onChange={handleChange} />
                </div>
              </div>

              <div className="grid-3">
                <select name="division_code" value={form.division_code} onChange={handleChange}>
                  <option value="">Select Division</option>
                  {renderOptions(divisions, "division_code", "division_name")}
                </select>

                <select name="district_code" value={form.district_code} onChange={handleChange}>
                  <option value="">Select District</option>
                  {renderOptions(districts, "district_code", "district_name")}
                </select>

                <select name="taluka_code" value={form.taluka_code} onChange={handleChange}>
                  <option value="">Select Taluka</option>
                  {renderOptions(talukas, "taluka_code", "taluka_name")}
                </select>
              </div>
            </div>

            {/* ===== DEPARTMENTS ===== */}
            <div className="org-section">
              <h3>3. Departments & Services</h3>

              <button type="button" className="add-btn" onClick={addDepartment}>
                + Add Department
              </button>
            </div>

            {/* ===== ACTIONS ===== */}
            <div className="org-actions">
              <button type="button" className="cancel" onClick={() => navigate(-1)}>Cancel</button>
              <button type="submit" className="submit">Submit</button>
            </div>

          </form>
        </div>
      </div>
    </div>
  </div>
);

}
