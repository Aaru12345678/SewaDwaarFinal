import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/AppointmentWizard.css"; // Link to basic CSS

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
  // Dummy data (replace with API calls)
  const organizations = [
    { id: "org1", name: "Organization 1" },
    { id: "org2", name: "Organization 2" }
  ];
  const departments = [
    { id: "dept1", name: "Department 1" },
    { id: "dept2", name: "Department 2" }
  ];
  const services = [
    { id: "service1", name: "Service 1" },
    { id: "service2", name: "Service 2" }
  ];
  const officers = [
    { id: "officer1", name: "John Doe" },
    { id: "officer2", name: "Jane Smith" }
  ];
  const slots = ["09:00", "10:00", "11:00", "14:00", "15:00"];

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData({ ...formData, documents: Array.from(files) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form Data Submitted:", formData);
    alert("Appointment submitted successfully!");
    navigate("/");
  };

  // Step Titles for progress bar
  const steps = [
    "Select Organization/Department/Service",
    "Choose Officer + Time Slot",
    "Enter Purpose + Upload Documents",
    "Confirm & Submit"
  ];

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


    {/* Organization Dropdown */}
    <label>Organization</label>
    <select
      name="org_id"
      value={formData.org_id}
      onChange={handleChange}
      required
    >
      <option value="">Select Organization</option>
      {organizations.map((org) => (
        <option key={org.id} value={org.id}>
          {org.name}
        </option>
      ))}
    </select>

    {/* Department Dropdown - Only show if mode is department */}
    {mode === "department" && (
      <>
        <label>Department</label>
        <select
          name="dept_id"
          value={formData.dept_id}
          onChange={handleChange}
          required
        >
          <option value="">Select Department</option>
          {departments.map((dept) => (
            <option key={dept.id} value={dept.id}>
              {dept.name}
            </option>
          ))}
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
    >
      <option value="">Select Service</option>
      {services.map((service) => (
        <option key={service.id} value={service.id}>
          {service.name}
        </option>
      ))}
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

            <label>Upload Documents</label>
            <input type="file" name="documents" onChange={handleChange} multiple />
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
