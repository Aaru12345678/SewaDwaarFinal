import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "../css/AppointmentWizard.css"; // Link to basic CSS
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { getVisitorDashboard } from "../services/api";
import { OfficerName,getOfficersByLocation,uploadAppointmentDocuments ,submitWalkinAppointment } from "../services/api.jsx"; // ✅ Officer API
// import VisitorNavbar from "./VisitorNavbar.jsx";
// import Header from '../Components/Header';
// import NavbarMain from '../Components/NavbarMain';
// import Footer from '../Components/Footer';
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
  getServices2,
  getVisitorDetails
} from '../services/api';
// import Swal from "sweetalert2";

const HelpdeskBooking = () => {

  const [loadingStates, setLoadingStates] = useState(false);
    const [loadingDivisions, setLoadingDivisions] = useState(false);
    const [loadingDistricts, setLoadingDistricts] = useState(false);
    const [loadingTalukas, setLoadingTalukas] = useState(false);
    const [showRegisterForm, setShowRegisterForm] = useState(false);


const [showErrors, setShowErrors] = useState(false);

const [visitorDetails, setVisitorDetails] = useState({
  full_name: "",
  gender: "",
  mobile_no: "",
  email_id: ""
});

const [visitorLoading, setVisitorLoading] = useState(false);

  const [step, setStep] = useState(1);
  // const [mode, setMode] = useState("department");

  const [officers, setOfficers] = useState([]);
const [loadingOfficers, setLoadingOfficers] = useState(false);

const [states, setStates] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [talukas, setTalukas] = useState([]);
  const [username2, setUsername] = useState("");
  const [visitorFetched, setVisitorFetched] = useState(false);
const [fetchError, setFetchError] = useState("");


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
      console.log(data,"data")
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
// const username = localStorage.getItem("username");

// useEffect(() => {
//   const fetchVisitorName = async () => {
//     if (!username) return;

//     const { data, error } = await getVisitorDashboard(username);

//     if (error) {
//       console.error("Failed to fetch visitor dashboard");
//       return;
//     }

//     if (data?.success) {
//       setFullName(data.data.full_name || username);
//     }
//   };

//   fetchVisitorName();
// }, [username]);
// 🔐 Location from localStorage (single source of truth)

const todayDate = useMemo(() => {
  const today = new Date();
  return today.toISOString().split("T")[0];
}, []);

const storedLocation = useMemo(() => ({
  state: localStorage.getItem("state") || "",
  division: localStorage.getItem("division") || "",
  district: localStorage.getItem("district") || "",
  taluka: localStorage.getItem("taluka") || ""
}), []);


  const [formData, setFormData] = useState({
  state: storedLocation.state,
  division: storedLocation.division,
  district: storedLocation.district,
  taluka: storedLocation.taluka,

  org_id: "",
  dept_id: "",
  service_id: "",
  officer_id: "",
  appointment_date: todayDate,
  slot_time: "",
  purpose: "",
  documents: []
});

 
useEffect(() => {
  if (!storedLocation.state) return;

  (async () => {
    await fetchDivisions(storedLocation.state);

    if (storedLocation.division) {
      await fetchDistricts(
        storedLocation.state,
        storedLocation.division
      );
    }

    if (storedLocation.district) {
      await fetchTalukas(
        storedLocation.state,
        storedLocation.division,
        storedLocation.district
      );
    }
  })();
}, [storedLocation]);

 
  const navigate = useNavigate();
  
  // const officers = [
  //   { id: "officer1", name: "John Doe" },
  //   { id: "officer2", name: "Jane Smith" }
  // ];
//   const slots = [
//   "09:00",
//   "10:00",
//   "11:00",
//   "14:00",
//   "15:00"
// ];
const formatTimeAMPM = (time24) => {
  let [hours, minutes] = time24.split(":").map(Number);
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${hours}:${minutes.toString().padStart(2, "0")} ${ampm}`;
};

  const slots = [
  "09:00",
  "10:00",
  "11:00",
  "14:00",
  "15:00"
];
// const formatTimeAMPM = (time24) => {
//   let [hours, minutes] = time24.split(":").map(Number);
//   const ampm = hours >= 12 ? "PM" : "AM";
//   hours = hours % 12 || 12;
//   return `${hours}:${minutes.toString().padStart(2, "0")} ${ampm}`;
// };


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

// const formatDateDDMMYYYY = (dateStr) => {
//   if (!dateStr) return "";
//   const [yyyy, mm, dd] = dateStr.split("-");
//   return `${dd}-${mm}-${yyyy}`;
// };


const formatDateDDMMYYYY = (dateStr) => {
  if (!dateStr) return "";
  const [yyyy, mm, dd] = dateStr.split("-");
  return `${dd}-${mm}-${yyyy}`;
};

console.log(visitorDetails.full_name,"visitorDetails.full_name")

const handleSubmit = async (e) => {
  e.preventDefault();

  if (!visitorFetched) {
    toast.error("Please fetch visitor details first");
    return;
  }
const payload = {
  visitor_id: visitorDetails.visitor_id,

  organization_id: formData.org_id,
  department_id: formData.dept_id || null,
  service_id: formData.service_id,

  purpose: formData.purpose,

  // ⚠️ MUST be YYYY-MM-DD
  walkin_date: todayDate, 

  slot_time: formData.slot_time,

  full_name: visitorDetails.full_name,
  gender: visitorDetails.gender,
  mobile_no: visitorDetails.mobile_no,
  email_id: visitorDetails.email_id || null,

  state_code: formData.state,
  division_code: formData.division || null,
  district_code: formData.district || null,
  taluka_code: formData.taluka || null,

  officer_id: formData.officer_id || null,

  status: "pending",     // ✅ lowercase
  remarks: null
};


  try {
    const { data } = await submitWalkinAppointment(payload);

    if (data?.success) {
      Swal.fire(
        "Success!",
        "Walk-in appointment booked successfully.",
        "success"
      ).then(() => navigate("/helpdesk/dashboard"));
    } else {
      toast.error(data?.message || "Failed to book walk-in appointment.");
    }
  } catch (err) {
    console.error("Submit error", err);
    toast.error("Something went wrong while submitting");
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

 const fetchServices = useCallback(
  async (organization_id, department_id) => {
    if (!organization_id || !department_id) return;

    setLoadingServices(true);
    const { data } = await getServices(organization_id, department_id);
    setLoadingServices(false);

    data ? setServices(data) : toast.error("Failed to load services");
  },
  []
);

  

useEffect(() => {
  const { state, division, district, taluka } = storedLocation;

  if (!state || !division) return;

  const fetchOrganizations = async () => {
    try {
      setLoadingOrganization(true);

      const params = {
        state_code: state,
        division_code: division,
        district_code: district || null,
        taluka_code: taluka || null
      };

      const res = await getOrganizationbyLocation(params);

      if (res?.data) {
        setOrganization(res.data);
      } else {
        setOrganization([]);
      }
    } catch (err) {
      console.error(err);
      setOrganization([]);
    } finally {
      setLoadingOrganization(false);
    }
  };

  fetchOrganizations();
}, [storedLocation]);

const handleChange = (e) => {
  const { name, value } = e.target;

  setFormData((prev) => {
    let updated = { ...prev, [name]: value };

    // Organization changed → reset dept & service
    if (name === "org_id") {
      updated.dept_id = "";
      updated.service_id = "";
      setDepartment([]);
      setServices([]);

      if (value) fetchDepartment(value);
    }

    // Department changed → fetch services
    if (name === "dept_id") {
      updated.service_id = "";
      setServices([]);

      if (value) fetchServices(updated.org_id, value);
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
  const { state, division, district, taluka } = storedLocation;

  if (!state || !division || !formData.org_id) {
    setOfficers([]);
    return;
  }

  const fetchOfficers = async () => {
    try {
      setLoadingOfficers(true);

      const payload = {
        state_code: state,
        division_code: division,
        district_code: district || null,
        taluka_code: taluka || null,
        organization_id: formData.org_id,
        department_id: formData.dept_id || null
      };

      const { data } = await getOfficersByLocation(payload);

      if (data?.success) {
        setOfficers(data.data);
      } else {
        setOfficers([]);
      }
    } catch (err) {
      setOfficers([]);
    } finally {
      setLoadingOfficers(false);
    }
  };

  fetchOfficers();
}, [storedLocation, formData.org_id, formData.dept_id]);



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
  return (
    visitorFetched && // 🔐 important
    !!formData.state &&
    !!formData.division &&
    !!formData.org_id &&
    !!formData.dept_id &&
    !!formData.service_id
  );
}, [formData, visitorFetched]);


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

const handleStepClick = (targetStep) => {
  // Step 1 is always accessible
  if (targetStep === 1) {
    setStep(1);
    return;
  }

  if (targetStep === 2 && !isStep1Valid) {
    toast.error("Please complete Step 1 first");
    return;
  }

  if (targetStep === 3 && (!isStep1Valid || !isStep2Valid)) {
    toast.error("Please complete previous steps first");
    return;
  }

  if (
    targetStep === 4 &&
    (!isStep1Valid || !isStep2Valid || !isStep3Valid)
  ) {
    toast.error("Please complete all previous steps first");
    return;
  }

  // ✅ Allowed navigation
  setStep(targetStep);
};

const getError = (condition, message) => {
  if (!showErrors) return null;
  return condition ? null : <span className="error-text">{message}</span>;
};
const handleGetVisitor = async () => {
  if (!username2 || username2.trim().length < 3) {
    toast.error("Enter Visitor ID / Mobile / Email");
    return;
  }

  try {
    setVisitorLoading(true);
    setVisitorFetched(false);

    const params = {};
    if (username2.includes("@")) {
      params.email_id = username2;
    } else if (/^\d+$/.test(username2)) {
      params.mobile_no = username2;
    } else {
      params.visitor_id = username2;
    }

    const res = await getVisitorDetails(params);

    console.log("API RESPONSE 👉", res);

    if (res?.data?.success && res.data.data) {
  setVisitorDetails(res.data.data);
  setVisitorFetched(true);
  setShowRegisterForm(false); // hide register form if found
} else {
  setVisitorFetched(false);
  setVisitorDetails({
    full_name: "",
    gender: "",
    mobile_no: "",
    email_id: ""
  });

  Swal.fire({
    icon: "warning",
    title: "User Not Found",
    text: "This visitor is not registered. Do you want to register?",
    showCancelButton: true,
    confirmButtonText: "Register User",
    cancelButtonText: "Cancel",
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#aaa"
  }).then((result) => {
    if (result.isConfirmed) {
      setShowRegisterForm(true); // 👈 show form
    }
  });
}

  } catch (err) {
    console.error("Visitor fetch failed", err);
    toast.error("Failed to fetch visitor");
  } finally {
    setVisitorLoading(false);
  }
};

  return (
    <>
    <div className="wizard-container">
      
      <h2>Book Walk-in Appointment</h2>

      {/* Progress Bar */}
      <div className="progressbar">
  {steps.map((label, index) => {
    const stepNumber = index + 1;

    return (
      <div
        key={stepNumber}
        className={`progress-step 
          ${step === stepNumber ? "active" : ""} 
          ${step > stepNumber ? "completed" : ""}`}
        onClick={() => handleStepClick(stepNumber)}
        style={{ cursor: "pointer" }}
      >
        <div className="step-number">{stepNumber}</div>
        <div className="step-label">{label}</div>
      </div>
    );
  })}
</div>


      {/* Form */}
      <form onSubmit={handleSubmit}>
  {/* Step 1 */}
  {step === 1 && (
  <div className="step-panel">

    {/* SEARCH MODE */}
    <div className="panel-section">
      <div className="section-title">Enter Visitor ID</div>
      <label>
  Visitor ID / Email / Mobile No <span className="required">*</span>
</label>

<div style={{ display: "flex", gap: "10px" }}>
  <input
    type="text"
    placeholder="Enter Visitor ID / Email / Mobile"
    value={username2}
    onChange={(e) => {
      setUsername(e.target.value);
      setVisitorFetched(false);
      setVisitorDetails({
        full_name: "",
        gender: "",
        mobile_no: "",
        email_id: ""
      });
    }}
  />

  <button
    type="button"
    onClick={handleGetVisitor}
    disabled={visitorLoading}
  >
    {visitorLoading ? "Getting..." : "Get"}
  </button>
</div>        
{showRegisterForm && (
  <div className="panel-section">
    <div className="section-title">Register New Visitor</div>

    {/* ⬇️ PASTE YOUR FORM EXACTLY AS IT IS ⬇️ */}
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
      </div>

      {/* Email & Mobile */}
      <div className="form-row contact-row">
        <div className="form-field">
          <label>Email *</label>
          <input
            type="email"
            name="email_id"
            value={formData.email_id}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-field">
          <label>Mobile *</label>
          <input
            name="mobile_no"
            value={formData.mobile_no}
            onChange={handleChange}
            maxLength={10}
            pattern="[6-9][0-9]{9}"
            required
          />
        </div>
      </div>

      {/* Gender & DOB */}
      <div className="form-row">
        <div className="form-field">
          <label>Gender *</label>
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
          <label>DOB *</label>
          <input
            type="date"
            name="dob"
            value={formData.dob}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      {/* Address */}
      <div className="form-field full">
        <label>Address *</label>
        <textarea
          name="address"
          value={formData.address}
          onChange={handleChange}
          required
        />
      </div>

      {/* Submit */}
      {/* <button type="submit" className="submit-btn">
        Register & Continue
      </button> */}
    </form>
  </div>
)}


  {visitorFetched && !showRegisterForm && (
  <div className="grid-4 visitor-preview">

    <div className="form-field">
      <label>Full Name</label>
      <input
        type="text"
        value={visitorDetails.full_name}
        readOnly
        disabled
      />
    </div>

    <div className="form-field">
      <label>Gender</label>
      <input
        type="text"
        value={
          visitorDetails.gender === "M"
            ? "Male"
            : visitorDetails.gender === "F"
            ? "Female"
            : visitorDetails.gender === "O"
            ? "Other"
            : ""
        }
        readOnly
        disabled
      />
    </div>

    <div className="form-field">
      <label>Mobile No</label>
      <input
        type="text"
        value={visitorDetails.mobile_no}
        readOnly
        disabled
      />
    </div>

    <div className="form-field">
      <label>Email ID</label>
      <input
        type="text"
        value={visitorDetails.email_id}
        readOnly
        disabled
      />
    </div>
    {/* <div className="form-row contact-row"> */}
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
            {/* {errors.pincode && (
              <p className="error-text">{errors.pincode}</p>
            )} */}
          </div>
        {/* </div> */}

        {/* Location */}
            <div className="form-field">
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

            {/* <div className="form-row location-row"> */}
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
            {/* </div> */}
          


  </div>
)}




      {/* <div className="section-title">Search Type</div>

      <div className="radio-group dashboard-radio">
        <label className={`radio-option ${mode === "department" ? "selected" : ""}`}>
          <input
            type="radio"
            checked={mode === "department"}
            onChange={() => setMode("department")}
          />
          Search by Department
        </label>

        <label className={`radio-option ${mode === "service" ? "selected" : ""}`}>
          <input
            type="radio"
            checked={mode === "service"}
            onChange={() => setMode("service")}
          />
          Search by Service
        </label>
      </div> */}
    </div>

    {/* LOCATION DETAILS */}
    <div className="panel-section">
      <div className="section-title">Location Details</div>

      <div className="grid-4">
        <div className="form-field">
          <label>State *</label>
          <select name="state" value={formData.state} disabled>
  {renderOptions(states, "state_code", "state_name")}
</select>
          {getError(formData.state, "State is required")}
        </div>

        <div className="form-field">
          <label>Division *</label>
          <select name="division" value={formData.division} disabled>
  {renderOptions(divisions, "division_code", "division_name")}
</select>

          {getError(formData.division, "Division is required")}
        </div>

        <div className="form-field">
          <label>District</label>
          <select name="district" value={formData.district} disabled>
  {renderOptions(districts, "district_code", "district_name")}
</select>
        </div>

        <div className="form-field">
          <label>Taluka</label>
          <select name="taluka" value={formData.taluka} disabled>
  {renderOptions(talukas, "taluka_code", "taluka_name")}
</select>
        </div>
      </div>
    </div>

    {/* OFFICE DETAILS */}
    <div className="panel-section">
      <div className="section-title">Office Details</div>

      <div className="grid-2">
        <div className="form-field">
          <label>Organization *</label>
          <select
            name="org_id"
            value={formData.org_id}
            onChange={handleChange}
          >
            <option value="">Select Organization</option>
            {organization.map(o => (
              <option key={o.organization_id} value={o.organization_id}>
                {o.organization_name}
              </option>
            ))}
          </select>
          {getError(formData.org_id, "Organization is required")}
        </div>

        <div className="form-field">
  <label>Department *</label>
  <select
    name="dept_id"
    value={formData.dept_id}
    onChange={handleChange}
  >
    <option value="">Select Department</option>
    {renderOptions(department, "department_id", "department_name")}
  </select>
  {getError(formData.dept_id, "Department is required")}
</div>


        <div className="form-field">
          <label>Service *</label>
          <select
            name="service_id"
            value={formData.service_id}
            onChange={handleChange}
          >
            <option value="">Select Service</option>
            {renderOptions(services, "service_id", "service_name")}
          </select>
          {getError(formData.service_id, "Service is required")}
        </div>
      </div>
    </div>

  </div>
)}

        {/* Step 2 */}
{step === 2 && (
  <div className="step2-panel">

    <div className="step2-field">
      <label>
        Officer <span className="required">*</span>
      </label>

      <select
        name="officer_id"
        value={formData.officer_id}
        onChange={handleChange}
        required
        disabled={loadingOfficers}
      >
        <option value="">
          {loadingOfficers
            ? "Loading officers..."
            : officers.length === 0
            ? "No officers available"
            : "Select Officer"}
        </option>

        {officers.map((officer) => (
          <option
            key={officer.officer_id}
            value={officer.officer_id}
          >
            {officer.full_name}
          </option>
        ))}
      </select>

      {getError(formData.officer_id, "Officer is required")}
    </div>

   <div className="form-field">
  <label>Appointment Date *</label>
  <input
    type="date"
    name="appointment_date"
    value={formData.appointment_date}
    disabled // 🚫 user cannot change
  />
</div>

    <div className="step2-field">
      <label>
        Time Slot <span className="required">*</span>
      </label>

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

  </div>
)}


        {/* Step 3 */}
{step === 3 && (
  <div className="step3-panel">

    {/* Purpose */}
    <div className="step3-field">
      <label>
        Purpose <span className="required">*</span>
      </label>

      <textarea
        name="purpose"
        value={formData.purpose}
        onChange={handleChange}
        rows={4}
        required
      />

      {getError(formData.purpose, "Purpose is required")}
    </div>

    {/* Document Upload */}
    <div className="step3-field">
      <label>
        Supporting Documents (PDF only)
        <span className="required">*</span>
      </label>

      <input
        type="file"
        name="documents"
        multiple
        accept="application/pdf"
        onChange={(e) => {
          const files = Array.from(e.target.files);

          const invalid = files.some(
            (file) => file.type !== "application/pdf"
          );

          if (invalid) {
            Swal.fire({
              icon: "error",
              title: "Invalid File!",
              text: "Only PDF files are allowed.",
            });
            e.target.value = "";
            return;
          }

          setFormData({ ...formData, documents: files });
        }}
      />

      <small className="hint-text">
        Upload scanned documents in PDF format only
      </small>

      {getError(formData.documents, "Document is required")}
    </div>

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
{/* Step 4 */}
{step === 4 && (
  <div className="step4-panel">

    <h3 className="confirm-title">Confirm Appointment Details</h3>

    <div className="confirm-grid">

      <div className="confirm-row">
        <span className="label">Organization</span>
        <span className="value">
          {selectedOrganization
            ? selectedOrganization.organization_name
            : "N/A"}
        </span>
      </div>

      <div className="confirm-row">
        <span className="label">Department</span>
        <span className="value">
          {selectedDepartment
            ? selectedDepartment.department_name
            : "N/A"}
        </span>
      </div>

      <div className="confirm-row">
        <span className="label">Service</span>
        <span className="value">
          {selectedService
            ? selectedService.service_name
            : "N/A"}
        </span>
      </div>

      <div className="confirm-row">
        <span className="label">Officer</span>
        <span className="value">
          {selectedOfficer
            ? selectedOfficer.full_name
            : "N/A"}
        </span>
      </div>

      <div className="confirm-row">
        <span className="label">Appointment Date</span>
        <span className="value">{formData.appointment_date}</span>
      </div>

      <div className="confirm-row">
        <span className="label">Time Slot</span>
        <span className="value">{formData.slot_time}</span>
      </div>

      <div className="confirm-row full-width">
        <span className="label">Purpose</span>
        <span className="value">{formData.purpose}</span>
      </div>

      <div className="confirm-row">
        <span className="label">Documents Uploaded</span>
        <span className="value">
          {formData.documents.length} file(s)
        </span>
      </div>

    </div>
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
    
    </>
  );
};

export default HelpdeskBooking;