import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "../css/AppointmentWizard.css"; // Link to basic CSS
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { OfficerName,getOfficersByLocation,uploadAppointmentDocuments  } from "../services/api.jsx"; // ✅ Officer API
import VisitorNavbar from "./VisitorNavbar.jsx";
import {
  getOrganization,
  getDepartment,
  getServices,
  submitAppointment,
  getServices2
} from '../services/api';
import Swal from "sweetalert2";

const AppointmentWizard = () => {
  const [step, setStep] = useState(1);
  const [mode, setMode] = useState("department");
  const [officers, setOfficers] = useState([]);
const [loadingOfficers, setLoadingOfficers] = useState(false);
  const [fullName, setFullName] = useState("");
const [isMetric, setIsMetric] = useState(true); // Our condition state
useEffect(() => {
  setFullName(localStorage.getItem("fullName") || "");
}, []);

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
  
  // const officers = [
  //   { id: "officer1", name: "John Doe" },
  //   { id: "officer2", name: "Jane Smith" }
  // ];
  const slots = ["09:00", "10:00", "11:00", "14:00", "15:00"];

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

const handleSubmit = async (e) => {
  e.preventDefault();

  // ✅ Validate required fields
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
    // ✅ Step 1: Prepare appointment payload
    const payload = {
      visitor_id: localStorage.getItem("username") || "VIS018",
      organization_id: formData.org_id,
      department_id: formData.dept_id,
      service_id: formData.service_id,
      officer_id: formData.officer_id,
      appointment_date: formData.appointment_date,
      slot_time: formData.slot_time,
      purpose: formData.purpose,
      insert_by: localStorage.getItem("user_id") || "system",
      insert_ip: "127.0.0.1",
    };

    // ✅ Step 2: Call API
    const response = await submitAppointment(payload);
    const { data, error } = response;

    if (error || !data?.success) {
      toast.error(data?.message || "Failed to book appointment.");
      return;
    }

    const appointmentId = data.appointment_id;
    console.log("✅ Appointment booked with ID:", appointmentId);

    // ✅ Step 3: Upload documents if any
    if (formData.documents?.length > 0) {
      const docResponse = await uploadAppointmentDocuments(
        appointmentId,
        formData.documents,
        localStorage.getItem("user_id") || "system",
        "General Document"
      );

      const { data: docData, error: docError } = docResponse;
      if (docError || !docData?.success) {

        toast.warn("Appointment booked, but failed to upload documents.");
      } else {
        console.log("📂 Documents uploaded:", docData);
      }
    }

    // ✅ Step 4: Success message + redirect
    Swal.fire({
        title: "Appointment Booked!",
        text: "Your appointment was successfully created.",
        icon: "success",
        confirmButtonText: "OK"
      }).then(() => navigate("/dashboard1"));

  } catch (err) {
    console.error("❌ Appointment booking error:", err);
    toast.error(
      err.response?.data?.message ||
        "Something went wrong while booking the appointment."
    );
  } finally {
    setSubmitting(false);
  }
};



  // Step Titles for progress bar
  const steps = [
    "Select Organization",
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

  const fetchServices = useCallback(async (organization_id, department_id = null) => {
  if (!organization_id) return;   // Org required in all cases

  // Mode: Search by Department → department_id MUST exist
  if (mode === "department" && !department_id) return;

  setLoadingServices(true);

  let data;

  // Case 1: Search by Department → API needs org + dept
  if (mode === "department") {
    const response = await getServices(organization_id, department_id);
    data = response.data;
console.log(data)

  }

  // Case 2: Search by Service → API needs only organization_id
  if (mode === "service") {
    const response = await getServices2(organization_id); 
    data = response.data;
console.log(data)

  }
  setLoadingServices(false);

  data ? setServices(data) : toast.error("Failed to load Services!");
}, [mode]);

  

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
    let updated = { ...prev, [name]: value };

    if (mode === "department") {
      // Reset when org changes
      if (name === "org_id") {
        updated.dept_id = "";
        updated.service_id = "";
        setDepartment([]);
        setServices([]);

        if (value) fetchDepartment(value);
      }

      // When department is selected → fetch services using UPDATED org_id
      if (name === "dept_id") {
        fetchServices(updated.org_id, value);
      }
    }

    if (mode === "service") {
      // Fetch services ONLY by org_id
      if (name === "org_id") {
        fetchServices(value, null);   // consistent usage
      }
    }

    return updated;
  });
};


// console.log(formData.org_id,"org_id")


   const renderOptions = (list, keyField, labelField) =>
    list.map((i) => (
      <option key={i[keyField]} value={i[keyField]}>
        {i[labelField]}
      </option>
    ));
    

//     useEffect(() => {
//   const state_code = localStorage.getItem("userstate_code");
//   const division_code = localStorage.getItem("userdivision_code");
//   const district_code = localStorage.getItem("userdistrict_code");
//   const taluka_code = localStorage.getItem("usertaluka_code");
  
//   if (
//     !state_code ||
//     !division_code ||
//     !district_code ||
//     !taluka_code ||
//     !formData.org_id ||
//     !formData.dept_id
//   ) {
//     // toast.error("Missing location data. Please re-login.");
//     return; // Wait until both org and dept are selected
//   }
//   console.log(state_code)
  
//   const fetchOfficers = async () => {
//     try {
//       setLoadingOfficers(true);

//       const payload = {
//         state_code,
//         division_code,
//         district_code,
//         taluka_code,
//         organization_id: formData.org_id,
//         department_id: formData.dept_id,
//       };

//       console.log("Fetching officers with payload:", payload);

//       const { data } = await getOfficersByLocation(payload);

//       if (data.success) {
//         setOfficers(data.data);
//       } else {
//         setOfficers([]);
//         toast.info(data.message || "No officers found");
//       }
//     } catch (err) {
//       console.error("Error fetching officers:", err);
//       toast.error("Error fetching officers");
//     } finally {
//       setLoadingOfficers(false);
//     }
//   };

//   fetchOfficers();
// }, [formData.org_id, formData.dept_id]);


useEffect(() => {
  const state_code = localStorage.getItem("userstate_code");
  const division_code = localStorage.getItem("userdivision_code");
  const district_code = localStorage.getItem("userdistrict_code");
  const taluka_code = localStorage.getItem("usertaluka_code");

  // Only stop if location or organization is missing
  if (
    !state_code ||
    !division_code ||
    !district_code ||
    !taluka_code ||
    !formData.org_id
  ) {
    return;
  }

  const fetchOfficers = async () => {
    try {
      setLoadingOfficers(true);

      const payload = {
        state_code,
        division_code,
        district_code,
        taluka_code,
        organization_id: formData.org_id,
        department_id: formData.dept_id || null,   // ✅ send null if no department selected
      };

      console.log("Fetching officers with payload:", payload);

      const { data } = await getOfficersByLocation(payload);

      if (data.success) {
        setOfficers(data.data);
      } else {
        setOfficers([]);
        toast.info(data.message || "No officers found");
      }
    } catch (err) {
      console.error("Error fetching officers:", err);
      toast.error("Error fetching officers");
    } finally {
      setLoadingOfficers(false);
    }
  };

  fetchOfficers();
}, [formData.org_id, formData.dept_id]);





  // 
  // Find selected names based on IDs
const selectedOrganization = organization.find(o => o.organization_id === formData.org_id);
const selectedDepartment = department.find(d => d.department_id === formData.dept_id);
const selectedService = services.find(s => s.service_id === formData.service_id);
const selectedOfficer = officers.find(o => o.officer_id === formData.officer_id);
// console.log(selectedOrganization,"selectedOrganization")

const today = new Date().toISOString().split("T")[0];


// filter for date or time:
const getAvailableSlots = () => {
  if (!formData.appointment_date) return slots;

  const selectedDate = new Date(formData.appointment_date);
  const today = new Date();

  const isToday =
    selectedDate.getFullYear() === today.getFullYear() &&
    selectedDate.getMonth() === today.getMonth() &&
    selectedDate.getDate() === today.getDate();

  if (!isToday) return slots; // All slots for future dates

  // For today: show only upcoming slots
  const currentMinutes = today.getHours() * 60 + today.getMinutes();

  return slots.filter(slot => {
    const [hh, mm] = slot.split(":");
    const slotMinutes = parseInt(hh) * 60 + parseInt(mm);
    return slotMinutes > currentMinutes; // future only
  });
};


  return (
    <>
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
  disabled={!formData.org_id || loadingOfficers}
>
  {/* Default Option */}
  <option value="">
    {loadingOfficers
      ? "Loading officers..."
      : officers.length === 0
      ? "No officers available"
      : "Select Officer"}
  </option>

  {/* Render Officer Names */}
  {officers.map((officer) => (
    <option key={officer.officer_id} value={officer.officer_id}>
      {officer.full_name}
    </option>
  ))}
</select>



            <label>Appointment Date</label>
<input
  type="date"
  name="appointment_date"
  value={formData.appointment_date}
  onChange={handleChange}
  min={today} 
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
  {getAvailableSlots().map((slot) => (
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

            {/* <input
  type="file"
  name="documents"
  multiple
  onChange={(e) => setFormData({...formData, documents: Array.from(e.target.files)})}
/> */}
<input
  type="file"
  name="documents"
  multiple
  accept="application/pdf"   // <-- Only allow PDF files
  onChange={(e) => {
    const files = Array.from(e.target.files);

    // Validate each file
    const invalid = files.some(file => file.type !== "application/pdf");

    if (invalid) {
      Swal.fire({
        icon: "error",
        title: "Invalid File!",
        text: "Only PDF files are allowed.",
      });
      e.target.value = ""; // Clear invalid selection
      return;
    }

    setFormData({ ...formData, documents: files });
  }}
/>

          </div>
        )}

        {/* Step 4 */}
        {/* {step === 4 && (
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
        )} */}
{step === 4 && (
  <div className="form-step">
    <h3>Confirm Details</h3>

    <p>
      <strong>Organization:</strong>{" "}
      {selectedOrganization ? selectedOrganization.organization_name : "N/A"}
    </p>

    <p>
      <strong>Department:</strong>{" "}
      {selectedDepartment ? selectedDepartment.department_name : "N/A"}
    </p>

    <p>
      <strong>Service:</strong>{" "}
      {selectedService ? selectedService.service_name : "N/A"}
    </p>

    <p>
      <strong>Officer:</strong>{" "}
      {selectedOfficer ? selectedOfficer.full_name : "N/A"}
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
    </>
  );
};

export default AppointmentWizard;