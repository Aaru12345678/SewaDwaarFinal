import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
 import "../css/OfficerForm.css";
import {
  registerOfficer,
  getStates,
  getDivisions,
  getDistricts,
  getTalukas,
  getOrganization,
  getDepartment,
  getDesignations,
} from "../services/api";

const OfficerForm = () => {
  const [formData, setFormData] = useState({
    full_name: "",
    mobile_no: "",
    email_id: "",
    password: "",
    confirmPassword: "",
    state_code: "",
    division_code: "",
    district_code: "",
    taluka_code: "",
    organization_id: "",
    department_id: "",
    designation_code: "",
  });

  const navigate=useNavigate();

  const [photoFile, setPhotoFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [states, setStates] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [talukas, setTalukas] = useState([]);

  const [organizations, setOrganizations] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);

  const [passwordMatch, setPasswordMatch] = useState(true);
  const [passwordStrength, setPasswordStrength] = useState(true);

  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;

  // Fetch initial data
  useEffect(() => {
    (async () => {
      const stateRes = await getStates(); setStates(stateRes.data || []);
      const orgRes = await getOrganization(); setOrganizations(orgRes.data || []);
      const desigRes = await getDesignations(); setDesignations(desigRes.data || []);
    })();
  }, []);

  const fetchDivisions = useCallback(async (stateCode) => {
    if (!stateCode) return setDivisions([]);
    const res = await getDivisions(stateCode); setDivisions(res.data || []);
  }, []);

  const fetchDistricts = useCallback(async (stateCode, divisionCode) => {
    if (!stateCode || !divisionCode) return setDistricts([]);
    const res = await getDistricts(stateCode, divisionCode); setDistricts(res.data || []);
  }, []);

  const fetchTalukas = useCallback(async (stateCode, divisionCode, districtCode) => {
    if (!stateCode || !divisionCode || !districtCode) return setTalukas([]);
    const res = await getTalukas(stateCode, divisionCode, districtCode); setTalukas(res.data || []);
  }, []);

  const fetchDepartments = useCallback(async (orgId) => {
    if (!orgId) return setDepartments([]);
    const res = await getDepartment(orgId); setDepartments(res.data || []);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };

      // Password validations
      if (name === "password") {
        setPasswordStrength(passwordRegex.test(value));
        setPasswordMatch(value === prev.confirmPassword);
      }
      if (name === "confirmPassword") {
        setPasswordMatch(prev.password === value);
      }

      // Cascading selects
      if (name === "state_code") {
        updated.division_code = updated.district_code = updated.taluka_code = "";
        setDivisions([]); setDistricts([]); setTalukas([]);
        if (value) fetchDivisions(value);
      }
      if (name === "division_code") {
        updated.district_code = updated.taluka_code = "";
        setDistricts([]); setTalukas([]);
        if (value) fetchDistricts(updated.state_code, value);
      }
      if (name === "district_code") {
        updated.taluka_code = "";
        setTalukas([]);
        if (value) fetchTalukas(updated.state_code, updated.division_code, value);
      }

      if (name === "organization_id") {
        updated.department_id = "";
        setDepartments([]);
        if (value) fetchDepartments(value);
      }

      return updated;
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 200 * 1024) { toast.error("File size exceeds 200 KB."); return; }
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const isFormValid = useMemo(() => {
    const { full_name, email_id, password, confirmPassword } = formData;
    return !!full_name && !!email_id && !!password && !!confirmPassword && passwordMatch && passwordStrength && !submitting;
  }, [formData, passwordMatch, passwordStrength, submitting]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return toast.error("Please fill all required fields correctly.");
    setSubmitting(true);

    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== undefined) {
          data.append(key, formData[key]);
        }
      });
      if (photoFile) data.append("photo", photoFile);

      const result = await registerOfficer(data);

      if (result.error) toast.error(result.error.message || "Registration failed");
      else {
        toast.success(result.data?.message || "Officer registered successfully!");

        setFormData({
          full_name: "", mobile_no: "", email_id: "", password: "", confirmPassword: "",
          state_code: "", division_code: "", district_code: "", taluka_code: "",
          organization_id: "", department_id: "", designation_code: ""
        });
        setPhotoFile(null); setPreview(null);
        setTimeout(()=>navigate("/Officerlogin"))
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error while registering officer");
    } finally {
      setSubmitting(false);
    }
  };

  const renderOptions = (list, valueField, labelField) =>
    list.map(item => <option key={item[valueField]} value={item[valueField]}>{item[labelField]}</option>);

  return (
    <div className="officer-form-container">
      <h2>Register New Officer</h2>
      <form className="officer-form" onSubmit={handleSubmit}>

        <div className="form-row">
          <label>Full Name *</label>
          <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} required />
        </div>

        <div className="form-row">
          <label>Mobile No *</label>
          <input type="text" name="mobile_no" value={formData.mobile_no} onChange={handleChange} required />
        </div>

        <div className="form-row">
          <label>Email *</label>
          <input type="email" name="email_id" value={formData.email_id} onChange={handleChange} required />
        </div>

        <div className="form-row">
          <label>Password *</label>
          <div style={{ display: "flex", alignItems: "center" }}>
            <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} required />
            <button type="button" onClick={() => setShowPassword(prev => !prev)}>{showPassword ? "Hide" : "Show"}</button>
          </div>
          {!passwordStrength && <p className="error-text">Password must be 8+ chars, include 1 uppercase, 1 number & 1 special char.</p>}
        </div>

        <div className="form-row">
          <label>Confirm Password *</label>
          <div style={{ display: "flex", alignItems: "center" }}>
            <input type={showConfirm ? "text" : "password"} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required />
            <button type="button" onClick={() => setShowConfirm(prev => !prev)}>{showConfirm ? "Hide" : "Show"}</button>
          </div>
          {!passwordMatch && <p className="error-text">Passwords do not match.</p>}
        </div>

        <div className="form-row">
          <label>Organization</label>
          <select name="organization_id" value={formData.organization_id} onChange={handleChange}>
            <option value="">Select Organization</option>
            {renderOptions(organizations, "organization_id", "organization_name")}
          </select>
        </div>

        <div className="form-row">
          <label>Department</label>
          <select name="department_id" value={formData.department_id} onChange={handleChange}>
            <option value="">Select Department</option>
            {renderOptions(departments, "department_id", "department_name")}
          </select>
        </div>

        <div className="form-row">
          <label>Designation</label>
          <select name="designation_code" value={formData.designation_code} onChange={handleChange}>
            <option value="">Select Designation</option>
            {renderOptions(designations, "designation_code", "designation_name")}
          </select>
        </div>

        <div className="form-row">
          <label>State</label>
          <select name="state_code" value={formData.state_code} onChange={handleChange}>
            <option value="">Select State</option>
            {renderOptions(states, "state_code", "state_name")}
          </select>
        </div>

        <div className="form-row">
          <label>Division</label>
          <select name="division_code" value={formData.division_code} onChange={handleChange}>
            <option value="">Select Division</option>
            {renderOptions(divisions, "division_code", "division_name")}
          </select>
        </div>

        <div className="form-row">
          <label>District</label>
          <select name="district_code" value={formData.district_code} onChange={handleChange}>
            <option value="">Select District</option>
            {renderOptions(districts, "district_code", "district_name")}
          </select>
        </div>

        <div className="form-row">
          <label>Taluka</label>
          <select name="taluka_code" value={formData.taluka_code} onChange={handleChange}><option value="">Select Taluka</option>{renderOptions(talukas, "taluka_code", "taluka_name")}</select>
        </div>
        <div className="form-row"><label>Upload Photo</label><input type="file" accept="image/*" onChange={handleFileChange} /></div>
        {preview && <div className="photo-preview"><img src={preview} alt="Preview" width={150} /></div>}
        <button type="submit" className="submit-btn" disabled={submitting}>{submitting ? "Submitting..." : "Register Officer"}</button>
      </form>
    </div>
  );
};

export default OfficerForm;
