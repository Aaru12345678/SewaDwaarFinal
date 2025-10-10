import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "../css/AppointmentWizard.css";
import { toast } from "react-toastify";
import { getVisitorDashboard } from "../services/api";
import VisitorNavbar from "./VisitorNavbar";
import {
  getOrganization,
  getDepartment,
  getServices,
  submitAppointment
} from "../services/api";

const AppointmentWizard = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [step, setStep] = useState(1);
  const [mode, setMode] = useState("department");
  const [submitting, setSubmitting] = useState(false);

  const [organization, setOrganization] = useState([]);
  const [department, setDepartment] = useState([]);
  const [services, setServices] = useState([]);

  const [loadingOrganization, setLoadingOrganization] = useState(false);
  const [loadingDepartment, setLoadingDepartment] = useState(false);
  const [loadingServices, setLoadingServices] = useState(false);

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

  const officers = [
    { id: "officer1", name: "John Doe" },
    { id: "officer2", name: "Jane Smith" }
  ];
  const slots = ["09:00", "10:00", "11:00", "14:00", "15:00"];

  // Progress Steps
  const steps = [
    "Select Organization/Department/Service",
    "Choose Officer + Time Slot",
    "Enter Purpose + Upload Documents",
    "Confirm & Submit"
  ];

  // Fetch organization list
useEffect(() => {
  const username = localStorage.getItem("username");
  if (!username) return;

  const fetchData = async () => {
    setLoadingOrganization(true);
    try {
      // 1️⃣ Fetch dashboard (full name + notifications if needed)
      const { data, error } = await getVisitorDashboard(username);
      if (error) {
        toast.error("Failed to fetch dashboard data");
        console.error(error);
      } else if (data && data.success) {
        setFullName(data.data.full_name || username);

      }

      // 2️⃣ Fetch organization list
      const { data: orgData } = await getOrganization();
      setOrganization(orgData || []);
    } catch (err) {
      console.error("Error fetching data:", err);
      toast.error("Failed to load data");
    } finally {
      setLoadingOrganization(false);
    }
  };

  fetchData();
}, [navigate]);


  // Fetch departments
  const fetchDepartment = useCallback(async (org_id) => {
    if (!org_id) return;
    try {
      setLoadingDepartment(true);
      const { data } = await getDepartment(org_id);
      setDepartment(data || []);
    } catch (err) {
      toast.error("Failed to load departments");
    } finally {
      setLoadingDepartment(false);
    }
  }, []);

  // Fetch services
  const fetchServices = useCallback(async (org_id, dept_id) => {
    if (!org_id || !dept_id) return;
    try {
      setLoadingServices(true);
      const { data } = await getServices(org_id, dept_id);
      setServices(data || []);
    } catch (err) {
      toast.error("Failed to load services");
    } finally {
      setLoadingServices(false);
    }
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };

      // Reset dependent fields
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

  // Render dropdown options
  const renderOptions = (list, keyField, labelField) =>
    list.map((item) => (
      <option key={item[keyField]} value={item[keyField]}>
        {item[labelField]}
      </option>
    ));

  // Navigate steps
  const handleNext = () => setStep((prev) => Math.min(prev + 1, steps.length));
  const handleBack = () => setStep((prev) => Math.max(prev - 1, 1));

  // Form submission
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
      formData.purpose
    ];

    if (requiredFields.includes("") || requiredFields.includes(null)) {
      toast.error("Please fill all required fields!");
      return;
    }

    setSubmitting(true);

    try {
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

      formData.documents.forEach((file) => payload.append("documents", file));

      const response = await submitAppointment(payload);
      if (response.data?.success) {
        toast.success("Appointment booked successfully!");
        navigate("/appointments");
      } else {
        toast.error(response.data?.message || "Failed to book appointment.");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
        <VisitorNavbar fullName={fullName} />
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

        <form onSubmit={handleSubmit}>
          {/* Step 1 */}
          {step === 1 && (
            <div className="form-step">
              <div className="radio-group">
                <label className={`radio-option ${mode === "department" ? "selected" : ""}`}>
                  <input
                    type="radio"
                    name="mode"
                    value="department"
                    checked={mode === "department"}
                    onChange={() => setMode("department")}
                  />
                  Search by Department
                </label>
                <label className={`radio-option ${mode === "service" ? "selected" : ""}`}>
                  <input
                    type="radio"
                    name="mode"
                    value="service"
                    checked={mode === "service"}
                    onChange={() => setMode("service")}
                  />
                  Search by Service
                </label>
              </div>

              <label>Organization</label>
              <select name="org_id" value={formData.org_id} onChange={handleChange} required>
                <option value="">
                  {loadingOrganization ? "Loading..." : "Select Organization"}
                </option>
                {renderOptions(organization, "organization_id", "organization_name")}
              </select>

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
              <select name="officer_id" value={formData.officer_id} onChange={handleChange} required>
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
              <select name="slot_time" value={formData.slot_time} onChange={handleChange} required>
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
              <textarea name="purpose" value={formData.purpose} onChange={handleChange} required />

              <label>Upload Documents</label>
              <input
                type="file"
                name="documents"
                multiple
                onChange={(e) =>
                  setFormData({ ...formData, documents: Array.from(e.target.files) })
                }
              />
            </div>
          )}

          {/* Step 4 */}
          {step === 4 && (
            <div className="form-step">
              <h3>Confirm Details</h3>
              <p><strong>Organization:</strong> {formData.org_id}</p>
              <p><strong>Department:</strong> {formData.dept_id}</p>
              <p><strong>Service:</strong> {formData.service_id}</p>
              <p><strong>Officer:</strong> {formData.officer_id}</p>
              <p><strong>Date:</strong> {formData.appointment_date}</p>
              <p><strong>Time Slot:</strong> {formData.slot_time}</p>
              <p><strong>Purpose:</strong> {formData.purpose}</p>
              <p><strong>Documents:</strong> {formData.documents.length} file(s)</p>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="buttons">
            {step > 1 && <button type="button" onClick={handleBack}>Back</button>}
            {step < 4 && <button type="button" onClick={handleNext}>Next</button>}
            {step === 4 && (
              <button type="submit" disabled={submitting}>
                {submitting ? "Submitting..." : "Submit"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default AppointmentWizard;
