import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "../css/AppointmentWizard.css"; // Link to basic CSS
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { getVisitorDashboard } from "../services/api";
import { OfficerName,getOfficersByLocation,uploadAppointmentDocuments  } from "../services/api.jsx"; // ✅ Officer API
import VisitorNavbar from "./VisitorNavbar.jsx";
import Header from '../Components/Header';
import NavbarMain from '../Components/NavbarMain';
import Footer from '../Components/Footer';
import './MainPage.css';
import Swal from "sweetalert2";
import NavbarTop from '../Components/NavbarTop';
import {
  getStates,
  getDivisions,
  getDistricts,
  getTalukas,
} from "../services/api";

import {
  getOrganization,
  getOrganizationbyLocation,
  getDepartment,
  getServices,
  submitAppointment,
  getServices2
} from '../services/api';
// import Swal from "sweetalert2";

const AppointmentWizard = () => {

  const [loadingStates, setLoadingStates] = useState(false);
    const [loadingDivisions, setLoadingDivisions] = useState(false);
    const [loadingDistricts, setLoadingDistricts] = useState(false);
    const [loadingTalukas, setLoadingTalukas] = useState(false);

const [showErrors, setShowErrors] = useState(false);


  const [step, setStep] = useState(1);
  const [mode, setMode] = useState("department");

  const [officers, setOfficers] = useState([]);
const [loadingOfficers, setLoadingOfficers] = useState(false);

const [states, setStates] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [talukas, setTalukas] = useState([]);

  // ✅ Step-wise validation

const [isManualDateEntry, setIsManualDateEntry] = useState(false);

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

const handleChange2 = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const updated = { ...prev, [name]: value };

      // if (name === "dob") {
      //   validateAge(value);
      // }

      // if (name === "password") {
      //   setPasswordStrength(passwordRegex.test(value));
      //   setPasswordMatch(value === prev.confirmPassword);
      // }

      // if (name === "confirmPassword") {
      //   setPasswordMatch(prev.password === value);
      // }

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

  const [fullName, setFullName] = useState("");
const [isMetric, setIsMetric] = useState(true); // Our condition state
const username = localStorage.getItem("username");

useEffect(() => {
  const fetchVisitorName = async () => {
    if (!username) return;

    const { data, error } = await getVisitorDashboard(username);

    if (error) {
      console.error("Failed to fetch visitor dashboard");
      return;
    }

    if (data?.success) {
      setFullName(data.data.full_name || username);
    }
  };

  fetchVisitorName();
}, [username]);


  const [formData, setFormData] = useState({
  state: "",
  division: "",
  district: "",
  taluka: "",
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
  const slots = [
  "09:00",
  "10:00",
  "11:00",
  "14:00",
  "15:00"
];
const formatTimeAMPM = (time24) => {
  let [hours, minutes] = time24.split(":").map(Number);
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${hours}:${minutes.toString().padStart(2, "0")} ${ampm}`;
};


 const handleNext = () => {
  setShowErrors(true); // 🔴 force show errors

  if (
    (step === 1 && !isStep1Valid) ||
    (step === 2 && !isStep2Valid) ||
    (step === 3 && !isStep3Valid)
  ) {
    return; // ❌ stop navigation
  }

  setShowErrors(false); // reset for next step
  setStep(step + 1);
};

  const handleBack = () => setStep(step - 1);

const formatDateDDMMYYYY = (dateStr) => {
  if (!dateStr) return "";
  const [yyyy, mm, dd] = dateStr.split("-");
  return `${dd}-${mm}-${yyyy}`;
};



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
      appointment_date:formatDateDDMMYYYY(formData.appointment_date),
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

    // ✅ Step 4: Success message + notify navbar
window.dispatchEvent(
  new CustomEvent("notification:new", {
    detail: { incrementBy: 1 }
  })
);

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

  

useEffect(() => {
  if (!formData.state || !formData.division) {
    setOrganization([]);
    return;
  }

  const fetchOrganizations = async () => {
    try {
      setLoadingOrganization(true);

      const params = {
        state_code: formData.state,
        division_code: formData.division,
        district_code: formData.district || null,
        taluka_code: formData.taluka || null
      };

      console.log("📤 Organization params:", params);

      const res = await getOrganizationbyLocation(params);
      console.log("📥 Organization response:", res);

      // ✅ FIXED
      if (res && !res.error) {
        setOrganization(res.data || []);
      } else {
        setOrganization([]);
        console.error(res?.error || "Failed to fetch organizations");
      }

    } catch (error) {
      console.error("Error fetching organizations:", error);
      setOrganization([]);
    } finally {
      setLoadingOrganization(false);
    }
  };

  fetchOrganizations();
}, [
  formData.state,
  formData.division,
  formData.district,
  formData.taluka
]);

const handleChange = (e) => {
  const { name, value } = e.target;
//  setIsManualDateEntry(false); // picker selection
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

// const HELPDESK_OFFICER = {
//   officer_id: "HELPDESK",
//   full_name: "Helpdesk Officer"
// };

useEffect(() => {
  const state_code = formData.state;
  const division_code = formData.division;
  const district_code = formData.district || null;
  const taluka_code = formData.taluka || null;
  const organization_id = formData.org_id;
  const department_id = formData.dept_id || null;

  // 🚫 Mandatory fields
  if (!state_code || !division_code || !organization_id) {
    setOfficers([]);
    return;
  }

  let isMounted = true;

  const fetchOfficers = async () => {
    try {
      setLoadingOfficers(true);

      const payload = {
        state_code,
        division_code,
        district_code,
        taluka_code,
        organization_id,
        department_id
      };

      const { data } = await getOfficersByLocation(payload);
      if (!isMounted) return;

      if (data?.success && Array.isArray(data.data)) {
        setOfficers(data.data);
      } else {
        setOfficers([]);
      }

    } catch (err) {
      console.error("❌ Error fetching officers:", err);
      setOfficers([]);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to fetch officers. Please try again."
      });
    } finally {
      if (isMounted) setLoadingOfficers(false);
    }
  };

  fetchOfficers();

  return () => {
    isMounted = false;
  };
}, [
  formData.state,
  formData.division,
  formData.district,
  formData.taluka,
  formData.org_id,
  formData.dept_id
]);


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

  if (!isToday) return slots;

  const currentMinutes = today.getHours() * 60 + today.getMinutes();

  return slots.filter((slot) => {
    const [hh, mm] = slot.split(":").map(Number);
    const slotMinutes = hh * 60 + mm;
    return slotMinutes > currentMinutes;
  });
};
const isStep1Valid = useMemo(() => {
  if (!formData.state || !formData.division) return false;
  if (!formData.org_id) return false;
  if (mode === "department" && !formData.dept_id) return false;
  if (!formData.service_id) return false;
  return true;
}, [formData, mode]);

const isStep2Valid = useMemo(() => {
  return (
    !!formData.officer_id &&
    !!formData.appointment_date &&
    !!formData.slot_time
  );
}, [formData]);

const isStep3Valid = useMemo(() => {
  return !!formData.purpose;
}, [formData]);

const getError = (condition, message) => {
  if (!showErrors) return null;
  return condition ? null : <span className="error-text">{message}</span>;
};

  return (
    <>
    <div className="fixed-header">
        <NavbarTop/>
        <Header />
      <VisitorNavbar fullName={fullName} />
        
      </div>
      <div className="main-layout">
  <div className="content-below">
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
     <div className="form-field full">
                <label htmlFor="state">
                  State <span className="required">*</span>
                </label>
                <select
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange2}
                  required
                >
                  <option value="">
                    {loadingStates ? "Loading..." : "Select State"}
                  </option>
                  {renderOptions(states, "state_code", "state_name")}
                </select>
                {getError(formData.state, "State is required")}
              </div>

              <div className="form-row location-row">
                <div className="form-field">
                  <label htmlFor="division">Division<span className="required">*</span></label>
                  <select
                    id="division"
                    name="division"
                    value={formData.division}
                    onChange={handleChange2}
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
                  {getError(formData.division, "Division is required")}
                </div>

                <div className="form-field">
                  <label htmlFor="district">District</label>
                  <select
                    id="district"
                    name="district"
                    value={formData.district}
                    onChange={handleChange2}
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
                    onChange={handleChange2}
                    disabled={!formData.district || loadingTalukas}
                  >
                    <option value="">
                      {loadingTalukas ? "Loading..." : "Select Taluka"}
                    </option>
                    {renderOptions(talukas, "taluka_code", "taluka_name")}
                  </select>
                </div>
              </div>

    {/* Organization Dropdown - always shown */}
    <label>Organization<span className="required">*</span></label>
   <select
  name="org_id"
  value={formData.org_id}
  onChange={handleChange}
  disabled={!formData.state || !formData.division || loadingOrganization}
  required
>
  <option value="">
    {loadingOrganization ? "Loading organizations..." : "Select Organization"}
  </option>

  {organization.map((org) => (
    <option key={org.organization_id} value={org.organization_id}>
      {org.organization_name}
    </option>
  ))}
</select>
                  {getError(formData.org_id, "Organization is required")}

    {/* Department Dropdown - only show if mode is "department" */}
    {mode === "department" && (
      <>
        <label>Department<span className="required">*</span></label>
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
        {getError(formData.dept_id, "Department is required")}
      </>
    )}

    {/* Service Dropdown */}
    <label>Service<span className="required">*</span></label>
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
    {getError(formData.service_id, "Service is required")}
  </div>
)}



        {/* Step 2 */}
        {step === 2 && (
          <div className="form-step">
           <label>Officer<span className="required">*</span></label>
<select
  name="officer_id"
  value={formData.officer_id}
  onChange={handleChange}
  required
  disabled={loadingOfficers}
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
{getError(formData.officer_id, "Officer is required")}


            <label>Appointment Date<span className="required">*</span></label>
<input
  type="date"
  name="appointment_date"
  value={formData.appointment_date}
  onChange={handleChange}
  onKeyDown={(e) => e.preventDefault()}
 // typing detected
  onPaste={(e) => e.preventDefault()}
   // paste detected
  min={today} 
  required
  // 🔴 Detect manual typing / paste
  // onKeyDown={() => setIsManualDateEntry(true)}
  // onPaste={() => setIsManualDateEntry(true)}

  // // ✅ Picker selection
  // onChange={(e) => {
  //   setIsManualDateEntry(false); // picker used
  //   setFormData(prev => ({
  //     ...prev,
  //     appointment_date: e.target.value
  //   }));
  
/>
<small className="error-text">
  Select date using calendar only
</small>
{getError(formData.appointment_date, "Date is required")}

<label>Time Slot<span className="required">*</span></label>
<select
  name="slot_time"
  value={formData.slot_time}
  onChange={handleChange}
  required
>
  <option value="">Select Slot</option>
  {getAvailableSlots().map((slot) => (
  <option key={slot} value={slot}>
    {formatTimeAMPM(slot)}
  </option>
))}

</select>
{getError(formData.slot_time, "Time is required")}
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="form-step">
            <label>Purpose<span className="required">*</span></label>
            <textarea
              name="purpose"
              value={formData.purpose}
              onChange={handleChange}
              required
            />
{getError(formData.purpose, "Purpose is required")}
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
{getError(formData.documents, "Document is required")}
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
          {/* {step ==1 && (<span>
    <button className="back-btn" onClick={() => navigate(-1)}>
                ← Back
              </button>
  </span>)}
           */}
          {step < 4 && (
  <button
    type="button"
    onClick={handleNext}
    disabled={step === 2 && isManualDateEntry}
  >
    Next
  </button>
)}
{step === 4 && <button type="submit">Submit</button>}
        </div>
      </form>
    </div>
    </div>
    </div>
    </>
  );
};

export default AppointmentWizard;