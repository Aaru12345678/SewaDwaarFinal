import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "../css/AppointmentWizard.css"; // Link to basic CSS
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import {
  getOrganization,
  getDepartment,
  getServices,
  submitAppointment
} from '../services/api';

const AppointmentWizard = () => {
  const [step, setStep] = useState(1);
  const [mode, setMode] = useState("department");
  const [formData, setFormData] = useState({
    org_id: "",
    dept_id: "",
    service_id: "",
    officer_id: "",
    appointment_date: "",
    slot_time: "",
    purpose: "",
    documents: []
  });
  const navigate = useNavigate();
  
  const officers = [
    { id: "officer1", name: "John Doe" },
    { id: "officer2", name: "Jane Smith" }
  ];
  const slots = ["09:00", "10:00", "11:00", "14:00", "15:00"];

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  // const handleChange = (e) => {
  //   const { name, value, files } = e.target;
  //   if (files) {
  //     setFormData({ ...formData, documents: Array.from(files) });
  //   } else {
  //     setFormData({ ...formData, [name]: value });
  //   }
  // };

 const handleSubmit = async (e) => {
  e.preventDefault();

  // Validate required fields
  const requiredFields = [
    formData.org_id,
    formData.dept_id,
    formData.service_id,
    formData.officer_id,
    formData.appointment_date,
    formData.slot_time,
    formData.purpose,
  ];

  if (requiredFields.includes("") || requiredFields.includes(null)) {
    toast.error("Please fill all required fields!");
    return;
  }

  setSubmitting(true);

  try {
    // Prepare FormData payload
    const payload = new FormData();
    payload.append("visitor_id", localStorage.getItem("visitor_id") || "VIS018");
    payload.append("organization_id", formData.org_id);
    payload.append("department_id", formData.dept_id);
    payload.append("service_id", formData.service_id);
    payload.append("officer_id", formData.officer_id);
    payload.append("appointment_date", formData.appointment_date);
    payload.append("slot_time", formData.slot_time);
    payload.append("purpose", formData.purpose);
    payload.append("insert_by", localStorage.getItem("user_id") || "system");
    payload.append("insert_ip", "127.0.0.1");

    // Add uploaded documents
    if (formData.documents?.length) {
      formData.documents.forEach((file, index) => {
        payload.append(`documents`, file); // Backend expects array field name: 'documents'
      });
    }

    // Submit the form
    const response = await submitAppointment(payload);
    const data = response?.data;

    if (data?.success) {
      toast.success("Appointment booked successfully!");
      navigate("/");
    } else {
      toast.error(data?.message || "Failed to book appointment.");
    }
  } catch (err) {
    console.error("Appointment booking error:", err.response?.data || err.message);
    toast.error(
      err.response?.data?.message || "Something went wrong while booking the appointment."
    );
  } finally {
    setSubmitting(false);
  }
};


  // Step Titles for progress bar
  const steps = [
    "Select Organization/Department/Service",
    "Choose Officer + Time Slot",
    "Enter Purpose + Upload Documents",
    "Confirm & Submit"
  ];

  // a
 const [organization,setOrganization]=useState([]);
 const [department,setDepartment]=useState([]);
 const [services,setServices]=useState([]);

 const [onboardMode, setOnboardMode] = useState("location");
 const [organizationOption, setOrganizationOption] = useState("");

  const [loadingOrganization, setLoadingOrganization] = useState(false);
  const [loadingDepartment, setLoadingDepartment] = useState(false);
  const [loadingServices, setLoadingServices] = useState(false);   
  const [submitting, setSubmitting] = useState(false);

  const fetchDepartment=useCallback(async(organization_id)=>{
    if(!organization_id) return;
    setLoadingDepartment(true);
    const {data} = await getDepartment(organization_id);
    setLoadingDepartment(false);
    data ? setDepartment(data):toast.error("Failed!");
  },[])

  const fetchServices=useCallback(async(organization_id,department_id)=>{
    if(!organization_id || !department_id) return;
    setLoadingServices(true);
    const {data}=await getServices(organization_id,department_id);
    setLoadingServices(false);
    data ? setServices(data) : toast.error("Failed to load Services!")
  },[])

useEffect(()=>{
  (
    async()=>{
      setLoadingOrganization(true);
      const {data}=await getOrganization();
      setLoadingOrganization(false);
      data ? setOrganization(data):toast.error("Failed to load organization.");
    }
  )();
},[])     

const handleChange = (e) => {
  const { name, value } = e.target;

  setFormData((prev) => {
    const updated = { ...prev, [name]: value };

    if (name === "org_id") {
      updated.dept_id = "";
      updated.service_id = "";
      setDepartment([]);
      setServices([]);
      if (value) fetchDepartment(value);
    }

    if (name === "dept_id") {
      updated.service_id = "";
      setServices([]);
      if (value) fetchServices(prev.org_id, value);
    }

    return updated;
  });
};


   const renderOptions = (list, keyField, labelField) =>
    list.map((i) => (
      <option key={i[keyField]} value={i[keyField]}>
        {i[labelField]}
      </option>
    ));
  // 

  return (
    <div className="wizard-container">
      <h2>Book an Appointment</h2>

      {/* Progress Bar */}
      <div className="progressbar">
        {steps.map((label, index) => {
          const stepNumber = index + 1;
          return (
            <div
              key={stepNumber}
              className={`progress-step ${step >= stepNumber ? "active" : ""}`}
            >
              <div className="step-number">{stepNumber}</div>
              <div className="step-label">{label}</div>
              {stepNumber < steps.length && (
                <div className={`step-line ${step > stepNumber ? "filled" : ""}`}></div>
              )}
            </div>
          );
        })}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
  {/* Step 1 */}
  {step === 1 && (
  <div className="form-step">
    <div className="radio-group">
      <label
        className={`radio-option ${mode === "department" ? "selected" : ""}`}
        htmlFor="byDept"
      >
        <input
          id="byDept"
          type="radio"
          name="mode"
          value="department"
          checked={mode === "department"}
          onChange={() => setMode("department")}
        />
        <span className="radio-text">Search by Department</span>
      </label>

      <label
        className={`radio-option ${mode === "service" ? "selected" : ""}`}
        htmlFor="byService"
      >
        <input
          id="byService"
          type="radio"
          name="mode"
          value="service"
          checked={mode === "service"}
          onChange={() => setMode("service")}
        />
        <span className="radio-text">Search by Service</span>
      </label>
    </div>

    {/* Organization Dropdown - always shown */}
    <label>Organization</label>
    <select
      name="org_id"
      value={formData.org_id}
      onChange={handleChange}
      required
    >
      <option value="">
        {loadingOrganization ? "Loading..." : "Select Organization"}
      </option>
      {renderOptions(organization, "organization_id", "organization_name")}
    </select>

    {/* Department Dropdown - only show if mode is "department" */}
    {mode === "department" && (
      <>
        <label>Department</label>
        <select
          name="dept_id"
          value={formData.dept_id}
          onChange={handleChange}
          disabled={!formData.org_id || loadingDepartment}
        >
          <option value="">
            {loadingDepartment ? "Loading..." : "Select Department"}
          </option>
          {renderOptions(department, "department_id", "department_name")}
        </select>
      </>
    )}

    {/* Service Dropdown */}
    <label>Service</label>
    <select
      name="service_id"
      value={formData.service_id}
      onChange={handleChange}
      required
      disabled={!formData.org_id || loadingServices}
    >
      <option value="">
        {loadingServices ? "Loading..." : "Select Services"}
      </option>
      {renderOptions(services, "service_id", "service_name")}
    </select>
  </div>
)}



        {/* Step 2 */}
        {step === 2 && (
          <div className="form-step">
            <label>Officer</label>
            <select
              name="officer_id"
              value={formData.officer_id}
              onChange={handleChange}
              required
            >
              <option value="">Select Officer</option>
              {officers.map((off) => (
                <option key={off.id} value={off.id}>
                  {off.name}
                </option>
              ))}
            </select>

            <label>Appointment Date</label>
            <input
              type="date"
              name="appointment_date"
              value={formData.appointment_date}
              onChange={handleChange}
              required
            />

            <label>Time Slot</label>
            <select
              name="slot_time"
              value={formData.slot_time}
              onChange={handleChange}
              required
            >
              <option value="">Select Slot</option>
              {slots.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="form-step">
            <label>Purpose</label>
            <textarea
              name="purpose"
              value={formData.purpose}
              onChange={handleChange}
              required
            />

            <input
  type="file"
  name="documents"
  multiple
  onChange={(e) => setFormData({...formData, documents: Array.from(e.target.files)})}
/>

          </div>
        )}

        {/* Step 4 */}
        {step === 4 && (
          <div className="form-step">
            <h3>Confirm Details</h3>
            <p>
              <strong>Organization:</strong> {formData.org_id}
            </p>
            <p>
              <strong>Department:</strong> {formData.dept_id}
            </p>
            <p>
              <strong>Service:</strong> {formData.service_id}
            </p>
            <p>
              <strong>Officer:</strong> {formData.officer_id}
            </p>
            <p>
              <strong>Date:</strong> {formData.appointment_date}
            </p>
            <p>
              <strong>Time Slot:</strong> {formData.slot_time}
            </p>
            <p>
              <strong>Purpose:</strong> {formData.purpose}
            </p>
            <p>
              <strong>Documents:</strong> {formData.documents.length} file(s)
            </p>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="buttons">
          {step > 1 && (
            <button type="button" onClick={handleBack}>
              Back
            </button>
          )}
          {step < 4 && (
            <button type="button" onClick={handleNext}>
              Next
            </button>
          )}
          {step === 4 && <button type="submit">Submit</button>}
        </div>
      </form>
    </div>
  );
};

export default AppointmentWizard;
