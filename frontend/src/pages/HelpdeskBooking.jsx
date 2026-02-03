import React, { useEffect, useState, useCallback, useMemo,useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../css/AppointmentWizard.css"; // Link to basic CSS
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { getVisitorDashboard } from "../services/api";
import { getAvailableSlots } from "../services/api";
import {FaUserCircle} from "react-icons/fa"
import { OfficerName,getOfficersByLocation,uploadAppointmentDocuments ,submitWalkinAppointment ,submitWalkinSignup} from "../services/api.jsx"; // ✅ Officer API
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
import Webcam from "react-webcam";


const HelpdeskBooking = () => {

  const [loadingStates, setLoadingStates] = useState(false);
    const [loadingDivisions, setLoadingDivisions] = useState(false);
    const [loadingDistricts, setLoadingDistricts] = useState(false);
    const [loadingTalukas, setLoadingTalukas] = useState(false);
    const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [is18, setIs18] = useState(true);

const [availableSlots, setAvailableSlots] = useState([]);
const [loadingSlots, setLoadingSlots] = useState(false);

const [showErrors, setShowErrors] = useState(false);

const [visitorDetails, setVisitorDetails] = useState({
  full_name: "",
  gender: "",
  mobile_no: "",
  email_id: ""
});
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [previewPhoto, setPreviewPhoto] = useState(null);
  const [showPhotoModal, setShowPhotoModal] = useState(false);

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
const [errors, setErrors] = useState({});
const webcamRef = useRef(null);
const [showCamera, setShowCamera] = useState(false);
const [capturedPhoto, setCapturedPhoto] = useState(null);


  // ✅ Step-wise validation

const [isManualDateEntry, setIsManualDateEntry] = useState(false);
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

  const validateRegisterField = (name, value) => {
  switch (name) {
    case "full_name":
      if (!value.trim()) return "Full name is required";
      if (!nameRegex.test(value)) return "Only letters and spaces allowed";
      return "";

    case "email_id":
      if (!value) return "Email is required";
      if (!emailRegex.test(value)) return "Invalid email format";
      return "";

    case "mobile_no":
      if (!value) return "Mobile number is required";
      if (!mobileRegex.test(value))
        return "Enter valid 10-digit mobile number";
      return "";

    case "gender":
      if (!value) return "Gender is required";
      return "";

    case "dob":
      if (!value) return "Date of birth is required";
      return "";

    case "address":
      if (!value.trim()) return "Address is required";
      return "";

    case "pincode":
      if (!value) return "Pincode is required";
      if (!pincodeRegex.test(value)) return "Invalid pincode";
      return "";

    case "state":
      if (!value) return "State is required";
      return "";

    case "division":
      if (!value) return "Division is required";
      return "";

    default:
      return "";
  }
};


const handleChange2 = (e) => {
  const { name, value } = e.target;

  setFormData((prev) => {
    const updated = { ...prev, [name]: value };
      if (name === "dob") validateAge(value);

    // LOCATION CASCADE (same logic you already have)
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

  // 🔴 LIVE FIELD VALIDATION (ONLY FOR REGISTER FORM)
  if (showRegisterForm) {
    const errorMsg = validateRegisterField(name, value);

    setErrors((prev) => ({
      ...prev,
      [name]: errorMsg || undefined
    }));
  }
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
// capture live photo:

const base64ToFile = (base64, filename) => {
  const arr = base64.split(",");
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new File([u8arr], filename, { type: mime });
};

const capturePhoto = () => {
  const imageSrc = webcamRef.current.getScreenshot();
  setCapturedPhoto(imageSrc);

  const photoFile = base64ToFile(
    imageSrc,
    `visitor_${Date.now()}.jpg`
  );

  setFormData(prev => ({
    ...prev,
    photo: photoFile // ✅ FILE, not base64
  }));

  setShowCamera(false);
};


const todayDate = useMemo(() => {
  const today = new Date();
  return today.toISOString().split("T")[0];
}, []);

const storedLocation = useMemo(() => {
 const clean = (v) => {
  if (v === null || v === undefined) return null;
  if (typeof v === "string") {
    const t = v.trim();
    if (t === "" || t.toLowerCase() === "null") return null;
    return t;
  }
  return v;
};




  return {
    state: clean(localStorage.getItem("state")),
    division: clean(localStorage.getItem("division")),
    district: clean(localStorage.getItem("district")),
    taluka: clean(localStorage.getItem("taluka"))
  };
}, []);


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

const filterSlotsByCurrentTime = (slots, selectedDate) => {
  if (!selectedDate) return slots;

  const today = new Date();
  const selected = new Date(selectedDate);

  const isToday =
    today.getFullYear() === selected.getFullYear() &&
    today.getMonth() === selected.getMonth() &&
    today.getDate() === selected.getDate();

  if (!isToday) return slots;

  const nowMinutes = today.getHours() * 60 + today.getMinutes();

  return slots.filter(slot => {
    const [hh, mm] = slot.slot_time.split(":").map(Number);
    return hh * 60 + mm > nowMinutes;
  });
};

useEffect(() => {
  const fetchSlots = async () => {
    if (!formData.appointment_date || !formData.org_id || !formData.officer_id) {
      setAvailableSlots([]);
      return;
    }

    try {
      setLoadingSlots(true);

      // ✅ Use localStorage for state/division/district/taluka
      const params = {
        p_date: formData.appointment_date,
        p_organization_id: formData.org_id,
        p_service_id: formData.service_id || null,
        p_officer_id: formData.officer_id || null,
        p_state_code: storedLocation.state,
        p_division_code: storedLocation.division || null,
        p_department_id: formData.dept_id || null,
        p_district_code: storedLocation.district || null,
        p_taluka_code: storedLocation.taluka || null
      };

      const res = await getAvailableSlots(params);
      setAvailableSlots(res?.data?.data ?? []);
    } catch (err) {
      console.error("❌ Slot fetch failed:", err);
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  fetchSlots();
}, [
  formData.appointment_date,
  formData.org_id,
  formData.service_id,
  formData.officer_id,
  formData.dept_id
  // removed formData.state/division/district/taluka dependencies
]);

  
const formatDateDDMMYYYY = (dateStr) => {
  if (!dateStr) return "";
  const [yyyy, mm, dd] = dateStr.split("-");
  return `${dd}-${mm}-${yyyy}`;
};

console.log(visitorDetails.full_name,"visitorDetails.full_name")
// regex:

const nameRegex = /^[A-Za-z\s]+$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const mobileRegex = /^[6-9]\d{9}$/;
  const pincodeRegex = /^\d{6}$/;


const validateForm = () => {
  const newErrors = {};


  // 🔑 Visitor search field (REQUIRED)
  // 🔑 Visitor search field
// Required ONLY when register form is NOT shown
if (!showRegisterForm) {
  if (!username2 || username2.trim() === "") {
    newErrors.username2 = "Visitor ID / Email / Mobile is required";
  }
}

  /* ---------------- VISITOR REGISTER VALIDATION ---------------- */
  /* ---------------- VISITOR REGISTER VALIDATION ---------------- */
if (showRegisterForm) {
  // Full Name
  if (!formData.full_name || !formData.full_name.trim()) {
    newErrors.full_name = "Full name is required";
  } else if (!nameRegex.test(formData.full_name)) {
    newErrors.full_name = "Name can contain only letters and spaces";
  }

  // Email
  // Email (OPTIONAL)
if (formData.email_id && !emailRegex.test(formData.email_id)) {
  newErrors.email_id = "Enter a valid email address";
}

  // Mobile
  if (!formData.mobile_no) {
    newErrors.mobile_no = "Mobile number is required";
  } else if (!mobileRegex.test(formData.mobile_no)) {
    newErrors.mobile_no = "Enter valid 10-digit mobile number";
  }

  // Gender
  if (!formData.gender) {
    newErrors.gender = "Gender is required";
  }

  // DOB
  if (!formData.dob) {
    newErrors.dob = "Date of birth is required";
  }

  // Address
  if (!formData.address || !formData.address.trim()) {
    newErrors.address = "Address is required";
  }

  // Pincode
  if (!formData.pincode) {
    newErrors.pincode = "Pincode is required";
  } else if (!pincodeRegex.test(formData.pincode)) {
    newErrors.pincode = "Enter valid 6-digit pincode";
  }

  // State
  if (!formData.state) {
    newErrors.state = "State is required";
  }

  // Division
  if (!formData.division) {
    newErrors.division = "Division is required";
  }

  // ❗ District & Taluka are optional (as per your logic)
}

  /* ---------------- OFFICE DETAILS ---------------- */
  if (!formData.dept_id) newErrors.dept_id = "Department is required";
  if (!formData.service_id) newErrors.service_id = "Service is required";

  /* ---------------- OFFICER & SLOT ---------------- */
  if (!formData.officer_id) newErrors.officer_id = "Officer is required";
  if (!formData.slot_time) newErrors.slot_time = "Time slot is required";

  /* ---------------- PURPOSE ---------------- */
  if (!formData.purpose) newErrors.purpose = "Purpose is required";

  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};


const handleSubmit = async (e) => {
  e.preventDefault();

  // 1️⃣ Validate form
  const isValid = validateForm();
  setShowErrors(true);
  if (!isValid) return;

  // 2️⃣ Ensure visitor info is ready
  if (!visitorFetched && !showRegisterForm) {
    toast.error("Please fetch visitor details first or register new visitor");
    return;
  }
  
if (showRegisterForm && !formData.photo) {
  toast.error("Please capture visitor photo");
  return;
}

  try {
    setSubmitting(true);
    let visitorId = visitorDetails.visitor_id;

    // 3️⃣ If new visitor, register first
    if (showRegisterForm) {
     const signupFormData = new FormData();

signupFormData.append("full_name", formData.full_name);
signupFormData.append("email_id", formData.email_id || "");
signupFormData.append("mobile_no", formData.mobile_no);
signupFormData.append("gender", formData.gender);
signupFormData.append("dob", formData.dob);
signupFormData.append("state", formData.state);
signupFormData.append("division", formData.division || "");
signupFormData.append("district", formData.district || "");
signupFormData.append("taluka", formData.taluka || "");
signupFormData.append("pincode", formData.pincode);

if (formData.photo) {
  signupFormData.append("photo", formData.photo); // ✅ multer key
}

const signupRes = await submitWalkinSignup(signupFormData);



      // const signupRes = await submitWalkinSignup(signupPayload);

      if (!signupRes.data.success) {
        toast.error(signupRes.data.message || "Failed to register visitor");
        return;
      }

      visitorId = signupRes.data.visitor_id;

      // Update local visitor state
      setVisitorDetails({
        ...visitorDetails,
        visitor_id: visitorId,
        full_name: formData.full_name,
        gender: formData.gender,
        mobile_no: formData.mobile_no,
        email_id: formData.email_id
      });

      setVisitorFetched(true);
      setShowRegisterForm(false);
      toast.success("Visitor registered successfully");
    }

    // 4️⃣ Prepare appointment payload
    const appointmentPayload = {
      visitor_id: visitorId,
      organization_id: formData.org_id,
      department_id: formData.dept_id || null,
      service_id: formData.service_id,
      purpose: formData.purpose,
      walkin_date: todayDate,
      slot_time: formData.slot_time,
      full_name: formData.full_name || visitorDetails.full_name,
      gender: formData.gender || visitorDetails.gender,
      mobile_no: formData.mobile_no || visitorDetails.mobile_no,
      email_id: formData.email_id || visitorDetails.email_id || null,
      state_code: formData.state,
      division_code: formData.division || null,
      district_code: formData.district || null,
      taluka_code: formData.taluka,
      officer_id: formData.officer_id || null,
      status: "pending",
      remarks: null
    };

    // 5️⃣ Submit appointment
    const appointmentRes = await submitWalkinAppointment(appointmentPayload);

    if (appointmentRes.data.success) {
      Swal.fire(
        "Success!",
        "Walk-in appointment booked successfully.",
        "success"
      ).then(() => navigate("/helpdesk/dashboard"));
    } else {
      toast.error(appointmentRes.data.message || "Failed to book appointment");
    }
  } catch (err) {
    console.error("Submit error", err);
    toast.error("Something went wrong while submitting");
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
    




const storedOrganizationId = localStorage.getItem("organization") || "";
useEffect(() => {
  if (storedOrganizationId) {
    setFormData(prev => ({
      ...prev,
      org_id: storedOrganizationId
    }));
  }
}, [storedOrganizationId]);


useEffect(() => {
  if (!storedOrganizationId) return;

  const fetchDept = async () => {
    try {
      setLoadingDepartment(true);
      const { data } = await getDepartment(storedOrganizationId);
      setLoadingDepartment(false);
      if (data) setDepartment(data);
    } catch (err) {
      console.error("Failed to fetch department", err);
      setDepartment([]);
      setLoadingDepartment(false);
    }
  };

  fetchDept();
}, [storedOrganizationId]);

useEffect(() => {
  if (!storedOrganizationId || !formData.dept_id) {
    setServices([]);
    return;
  }

  const fetchServicesByDept = async () => {
    try {
      setLoadingServices(true);
      const { data } = await getServices(storedOrganizationId, formData.dept_id);
      setLoadingServices(false);
      if (data) setServices(data);
    } catch (err) {
      console.error("Failed to fetch services", err);
      setServices([]);
      setLoadingServices(false);
    }
  };

  fetchServicesByDept();
}, [storedOrganizationId, formData.dept_id]);

useEffect(() => {
  const clean = (v) => {
    if (v === null || v === undefined) return null;
    if (typeof v === "string") {
      const t = v.trim();
      if (t === "" || t.toLowerCase() === "null") return null;
      return t;
    }
    return v;
  };

  if (!storedOrganizationId || !formData.dept_id) {
    setOfficers([]);
    return;
  }

  let isMounted = true;

  const fetchOfficers = async () => {
    try {
      setLoadingOfficers(true);

      // ✅ Use localStorage values for location instead of formData
      const payload = {
        state_code: clean(localStorage.getItem("state")),
        division_code: clean(localStorage.getItem("division")),
        district_code: clean(localStorage.getItem("district")),
        taluka_code: clean(localStorage.getItem("taluka")),
        organization_id: clean(storedOrganizationId),
        department_id: clean(formData.dept_id)
      };

      const { data } = await getOfficersByLocation(payload);
      if (!isMounted) return;

      if (data?.success && Array.isArray(data.data)) {
        setOfficers(data.data);
      } else {
        setOfficers([]);
      }
    } catch (err) {
      console.error("Error fetching officers:", err);
      setOfficers([]);
      toast.error("Failed to fetch officers");
    } finally {
      if (isMounted) setLoadingOfficers(false);
    }
  };

  fetchOfficers();
  return () => { isMounted = false; };
}, [storedOrganizationId, formData.dept_id]); // only depend on org & dept

  // 
  // Find selected names based on IDs
const selectedOrganization = organization.find(o => o.organization_id === formData.org_id);
const selectedDepartment = department.find(d => d.department_id === formData.dept_id);
const selectedService = services.find(s => s.service_id === formData.service_id);
const selectedOfficer = officers.find(o => o.officer_id === formData.officer_id);
// console.log(selectedOrganization,"selectedOrganization")

const today = new Date().toISOString().split("T")[0];


// filter for date or time:


const getError = (field) => {
  if (!showErrors && !errors[field]) return null;
  if (!errors[field]) return null;

  return <span className="error-text">{errors[field]}</span>;
};

const getVisitorPhotoCandidates = (photo) => {
  if (!photo) return [];

  if (photo.startsWith("http")) return [photo];

  return [
    `http://localhost:5000/uploads/${photo}`,
    `http://localhost:5000/uploads/visitors/${photo}`
  ];
};

const VisitorPhoto = ({ photo, onClick }) => {
  const urls = getVisitorPhotoCandidates(photo);
  const [index, setIndex] = useState(0);

  if (!photo) {
    return <FaUserCircle className="visitor-photo-icon" />;
  }

  return (
    <img
      src={urls[index]}
      alt="Visitor"
      className="visitor-photo clickable"
      onClick={() => onClick?.(urls[index])}
      onError={() => {
        if (index < urls.length - 1) {
          setIndex(index + 1); // 🔁 try next URL
        }
      }}
    />
  );
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

    const visitor = res?.data?.data;
    const success = res?.data?.success;

    // ✅ VISITOR FOUND
    if (success && visitor) {
      setVisitorDetails(visitor);
      setVisitorFetched(true);
      setShowRegisterForm(false);
      return;
    }

    // ❌ VISITOR NOT FOUND → SHOW MODAL
    setVisitorFetched(false);
    setVisitorDetails({
      full_name: "",
      gender: "",
      mobile_no: "",
      email_id: ""
    });

    Swal.fire({
      icon: "warning",
      title: "Visitor Not Found",
      text: "This visitor is not registered. Do you want to register?",
      showCancelButton: true,
      confirmButtonText: "Register Visitor",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#aaa"
    }).then((result) => {
      if (result.isConfirmed) {
        setShowRegisterForm(true);
      }
    });

  } catch (err) {
    // ✅ EVEN IF API FAILS → STILL SHOW REGISTER OPTION
    console.error("Visitor fetch failed", err);

    Swal.fire({
      icon: "warning",
      title: "Visitor Not Found",
      text: "This visitor is not registered. Do you want to register?",
      showCancelButton: true,
      confirmButtonText: "Register Visitor",
      cancelButtonText: "Cancel"
    }).then((result) => {
      if (result.isConfirmed) {
        setShowRegisterForm(true);
      }
    });
  } finally {
    setVisitorLoading(false);
  }
};
console.log("ERRORS STATE 👉", errors);
useEffect(() => {
  if (showRegisterForm) {
    setErrors(prev => {
      const { username2, ...rest } = prev;
      return rest;
    });
  }
}, [showRegisterForm]);


  return (
    <>
    <div className="wizard-container">
      
      <h2>Book Walk-in Appointment</h2>

      


      {/* Form */}
   <form onSubmit={handleSubmit}>
  {/* VISITOR SEARCH */}
 {!showRegisterForm && (
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

    {getError("username2")}
  </div>
)}

  {/* REGISTER FORM */}
  {showRegisterForm && (
  <div className="panel-section visitor-new">
    <div className="section-title">Register New Visitor</div>
{/* Live Photo Capture */}
<div className="form-field full center">
  <label>Visitor Photo <span className="required">*</span></label>

  {!capturedPhoto && !showCamera && (
    <button
      type="button"
      className="btn-primary"
      onClick={() => setShowCamera(true)}
    >
      📸 Click Photo
    </button>
  )}

  {showCamera && (
    <div className="camera-box">
      <Webcam
        ref={webcamRef}
        audio={false}
        screenshotFormat="image/jpeg"
        width={220}
      />
      <div className="camera-actions">
        <button type="button" onClick={capturePhoto} className="btn-success">
          Capture
        </button>
        <button
          type="button"
          onClick={() => setShowCamera(false)}
          className="btn-secondary"
        >
          Cancel
        </button>
      </div>
    </div>
  )}

  {capturedPhoto && (
    <div className="photo-preview">
      <img src={capturedPhoto} alt="Visitor" />
      <button
        type="button"
        className="btn-link"
        onClick={() => {
          setCapturedPhoto(null);
          setFormData(prev => ({ ...prev, photo: null }));
        }}
      >
        Retake Photo
      </button>
    </div>
  )}
</div>

    <div className="grid-4">

      {/* Full Name */}
      <div className="form-field full">
        <label>Full Name <span className="required">*</span></label>
        <input
          name="full_name"
          value={formData.full_name || ""}
          onChange={handleChange2}
        />
        {getError("full_name")}
      </div>

      {/* Email */}
      <div className="form-field">
        <label>Email</label>
        <input
          type="email"
          name="email_id"
          value={formData.email_id || ""}
          onChange={handleChange2}
        />
        {getError("email_id")}
      </div>

      {/* Mobile */}
      <div className="form-field">
        <label>Mobile No <span className="required">*</span></label>
        <input
          name="mobile_no"
          value={formData.mobile_no || ""}
          onChange={handleChange2}
          maxLength={10}
        />
        {getError("mobile_no")}
      </div>

      {/* Gender */}
      <div className="form-field">
        <label>Gender <span className="required">*</span></label>
        <select
          name="gender"
          value={formData.gender || ""}
          onChange={handleChange2}
        >
          <option value="">Select Gender</option>
          <option value="M">Male</option>
          <option value="F">Female</option>
          <option value="O">Other</option>
        </select>
        {getError("gender")}
      </div>

      {/* DOB */}
      <div className="form-field">
        <label>DOB <span className="required">*</span></label>
        <input
          type="date"
          name="dob"
          value={formData.dob || ""}
          onChange={handleChange2}
        />
        {getError("dob")}
      </div>

      {/* Address */}
      <div className="form-field">
        <label>Address <span className="required">*</span></label>
        <textarea
          name="address"
          value={formData.address || ""}
          onChange={handleChange2}
        />
        {getError("address")}
      </div>

      {/* PinCode */}
      <div className="form-field">
        <label>PinCode <span className="required">*</span></label>
        <input
          name="pincode"
          value={formData.pincode || ""}
          onChange={handleChange2}
        />
        {getError("pincode")}
      </div>

      {/* Empty placeholders to keep grid aligned */}
      
      {/* State */}
      <div className="form-field">
        <label>State <span className="required">*</span></label>
        <select
          name="state"
          value={formData.state}
          onChange={handleChange2}
        >
          <option value="">
            {loadingStates ? "Loading..." : "Select State"}
          </option>
          {renderOptions(states, "state_code", "state_name")}
        </select>
        {getError("state")}
      </div>

      {/* Division */}
      <div className="form-field">
        <label>Division <span className="required">*</span></label>
        <select
          name="division"
          value={formData.division}
          onChange={handleChange2}
          disabled={!formData.state || loadingDivisions}
        >
          <option value="">
            {loadingDivisions ? "Loading..." : "Select Division"}
          </option>
          {renderOptions(divisions, "division_code", "division_name")}
        </select>
        {getError("division")}
      </div>

      {/* District */}
      <div className="form-field">
        <label>District</label>
        <select
          name="district"
          value={formData.district}
          onChange={handleChange2}
          disabled={!formData.division || loadingDistricts}
        >
          <option value="">
            {loadingDistricts ? "Loading..." : "Select District"}
          </option>
          {renderOptions(districts, "district_code", "district_name")}
        </select>
      </div>

      {/* Taluka */}
      <div className="form-field">
        <label>Taluka</label>
        <select
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
  </div>
)}

  {/* VISITOR DETAILS READ-ONLY */}
 {visitorFetched && !showRegisterForm && (
  <div className="panel-section visitor-readonly">
    <div className="section-title">Visitor Details</div>

    {/* PROFILE PHOTO */}
     <div className="visitor-photo-wrapper">
  <VisitorPhoto
    photo={visitorDetails?.photo}
    onClick={(url) => {
      setPreviewPhoto(url);
      setShowPhotoModal(true);
    }}
  />
</div>
{showPhotoModal && (
  <div className="photo-modal-overlay" onClick={() => setShowPhotoModal(false)}>
    <div
      className="photo-modal"
      onClick={(e) => e.stopPropagation()}
    >
      <img
        src={previewPhoto}
        alt="Visitor"
        className="photo-modal-img"
      />

      <button
        className="close-btn"
        onClick={() => setShowPhotoModal(false)}
      >
        ✕
      </button>
    </div>
  </div>
)}




    <div className="grid-4">
      <div className="form-field">
        <label>Full Name<span className="required">*</span></label>
        <input value={visitorDetails.full_name} disabled />
      </div>

      <div className="form-field">
        <label>Gender<span className="required">*</span></label>
        <input
          value={
            visitorDetails.gender === "M"
              ? "Male"
              : visitorDetails.gender === "F"
              ? "Female"
              : "Other"
          }
          disabled
        />
      </div>

      <div className="form-field">
        <label>Mobile No<span className="required">*</span></label>
        <input value={visitorDetails.mobile_no} disabled />
      </div>

      <div className="form-field">
        <label>Email ID</label>
        <input value={visitorDetails.email_id} disabled />
      </div>
    </div>
  </div>
)}

  {/* OFFICE DETAILS */}
  <div className="panel-section">
    <div className="section-title">Office Details</div>
    <div className="grid-2">
      <input type="hidden" name="org_id" value={storedOrganizationId} />

      {/* Department */}
      <div className="form-field">
        <label>Department <span className="required">*</span></label>
        <select
          name="dept_id"
          value={formData.dept_id}
          onChange={handleChange}
        >
          <option value="">Select Department</option>
          {department.map((d) => (
            <option key={d.department_id} value={d.department_id}>
              {d.department_name}
            </option>
          ))}
        </select>
        {getError("dept_id")}
      </div>

      {/* Service */}
      <div className="form-field">
        <label>Service <span className="required">*</span></label>
        <select
          name="service_id"
          value={formData.service_id}
          onChange={handleChange}
          disabled={!formData.dept_id || loadingServices}
        >
          <option value="">
            {loadingServices ? "Loading services..." : "Select Service"}
          </option>
          {services.map((s) => (
            <option key={s.service_id} value={s.service_id}>
              {s.service_name}
            </option>
          ))}
        </select>
{getError("service_id")}      </div>
    </div>
  </div>

  {/* OFFICER & SLOT */}
  <div className="panel-section">
    <div className="section-title">Officer & Appointment</div>
    <div className="grid-2">
  <div className="form-field">
  <label>Officer <span className="required">*</span></label>
  <select
    name="officer_id"
    value={formData.officer_id}
    onChange={handleChange}
    
    disabled={loadingOfficers || !formData.service_id}
  >
    <option value="">
      {loadingOfficers
        ? "Loading officers..."
        : officers.length === 0
        ? "No officers available"
        : "Select Officer"}
    </option>
    {officers.map((officer) => (
      <option key={officer.officer_id} value={officer.officer_id}>
        {officer.full_name}
      </option>
    ))}
  </select>
  {getError("officer_id")}
</div>

      <div className="form-field">
        <label>Appointment Date <span className="required">*</span></label>
        <input
          type="date"
          name="appointment_date"
          value={formData.appointment_date}
          disabled
        />
  {getError("appointment_date")}

      </div>

     <div className="form-field">
  <label>
    Time Slot <span className="required">*</span>
  </label>

  <select
    name="slot_time"
    value={formData.slot_time}
    onChange={(e) => {
      const selected = availableSlots.find(
        s => s.slot_time === e.target.value
      );

      setFormData(prev => ({
        ...prev,
        slot_time: selected.slot_time,
        slot_end_time: selected.slot_end_time
      }));
    }}
  >
    <option value="">
      {loadingSlots
        ? "Loading slots..."
        : availableSlots.length === 0
        ? "No slots available"
        : "Select Slot"}
    </option>

    {filterSlotsByCurrentTime(
      availableSlots.filter(slot => slot.is_available),
      formData.appointment_date
    ).map(slot => (
      <option key={slot.slot_time} value={slot.slot_time}>
        {formatTimeAMPM(slot.slot_time)} – {formatTimeAMPM(slot.slot_end_time)}
      </option>
    ))}
  </select>
    {getError("slot_time")}

</div>

    </div>
  </div>

  {/* PURPOSE & DOCUMENTS */}
  <div className="panel-section">
    <div className="section-title">Purpose & Documents</div>
    <div className="grid-1">
      <div className="form-field">
        <label>Purpose <span className="required">*</span></label>
        <textarea
          name="purpose"
          value={formData.purpose}
          onChange={handleChange}
          rows={4}
        
        />
            {getError("purpose")}

      </div>

      <div className="form-field">
        <label>Supporting Documents (PDF only)</label>
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
  </div>

  {/* SUBMIT */}
  <div className="buttons">
    <button type="submit" disabled={submitting}>
  {submitting ? "Booking appointment..." : "Submit"}
</button>

  </div>
</form>

    </div>
    
    </>
  );
};

export default HelpdeskBooking;