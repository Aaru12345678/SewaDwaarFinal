import React, { useEffect, useState, useMemo,useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { toast } from "react-toastify";
import "../css/EditProfile.css";
import {updateVisitorProfile} from "../services/api"
import NavbarTop from "../Components/NavbarTop";
import Header from "../Components/Header";
import VisitorNavbar from "./VisitorNavbar";
import { getVisitorProfile } from "../services/api";
import {
  getStates,
  getDivisions,
  getDistricts,
  getTalukas,
  submitSignup,
} from "../services/api";
import Swal from "sweetalert2";


// --------------------------
// Validation schema
// --------------------------
const ProfileSchema = Yup.object().shape({
  name: Yup.string()
    .matches(/^[A-Za-z\s]+$/, "Only alphabets allowed")
    .min(3, "Name must be at least 3 characters")
    .max(150, "Name too long")
    .required("Full name is required"),

  email: Yup.string()
    .email("Invalid email format")
    .max(255, "Email too long")
    .required("Email is required"),

  phone: Yup.string()
    .matches(/^[6-9]\d{9}$/, "Mobile must start with 6–9 and be 10 digits")
    .required("Mobile number is required"),

  gender: Yup.string()
    .oneOf(["M", "F", "O"], "Invalid gender")
    .required("Gender is required"),

  dob: Yup.date()
    .required("Date of birth is required")
    .test(
      "age-check",
      "You must be at least 18 years old",
      function (value) {
        if (!value) return false;
        const today = new Date();
        const dob = new Date(value);
        let age = today.getFullYear() - dob.getFullYear();
        const m = today.getMonth() - dob.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
          age--;
        }
        return age >= 18;
      }
    ),

  address: Yup.string()
    .min(5, "Address too short")
    .max(100, "Address too long")
     .matches(
    /^[A-Za-z0-9\s]+$/,
    "Address can only contain letters, numbers, and spaces"
  )
  .required("Address is required"),

  state: Yup.string().required("State is required"),

  division: Yup.string().nullable(),
  district: Yup.string().nullable(),
  taluka: Yup.string().nullable(),

  pincode: Yup.string()
    .matches(/^\d{6}$/, "Pincode must be exactly 6 digits")
    .required("Pincode is required"),
});

 
// Helper: date → yyyy-MM-dd for <input type="date">
const formatDateForInput = (value) => {
  if (!value) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

  const d = new Date(value);
  if (Number.isNaN(d.getTime())) {
    return value.split("T")[0] || "";
  }

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Helper: build initial photo URL
const buildInitialImageUrl = (photo) => {
  if (!photo) return "";
  if (photo.startsWith("data:")) return photo;
  if (photo.startsWith("http://") || photo.startsWith("https://")) return photo;

  const fileName = photo.includes(".") ? photo : `${photo}.jpg`;
  return `http://localhost:5000/uploads/${fileName}`;
};

export default function EditProfile() {
  const navigate = useNavigate();
  const location = useLocation();
 const username = localStorage.getItem("username");
const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
    const [visitor, setVisitor] = useState(null);
  const [states, setStates] = useState([]);
    const [divisions, setDivisions] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [talukas, setTalukas] = useState([]);
   const [loadingStates, setLoadingStates] = useState(false);
    const [loadingDivisions, setLoadingDivisions] = useState(false);
    const [loadingDistricts, setLoadingDistricts] = useState(false);
    const [loadingTalukas, setLoadingTalukas] = useState(false);
  
  const [fullName, setFullName] = useState("");
useEffect(() => {
    if (!username) {
      setError("Session expired. Please login again.");
      setLoading(false);
      return;
    }

    
 const fetchProfile = async () => {
      try {
        const res = await getVisitorProfile(username);

        if (res.data?.success) {
          setVisitor(res.data.data);
        setFullName(res.data.data.full_name || username);

        } else {
          setError("Profile not found");
        }
      } catch (err) {
        setError("Session expired. Please login again.");
        localStorage.clear();
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username, navigate]);


 /* ===================== FETCHERS ===================== */
  const fetchDivisions = useCallback(async (stateCode) => {
    if (!stateCode) return;
    setLoadingDivisions(true);
    const { data } = await getDivisions(stateCode);
    setLoadingDivisions(false);
    if (data) setDivisions(data);
  }, []);

  const fetchDistricts = useCallback(async (stateCode, divisionCode) => {
    if (!stateCode || !divisionCode) return;
    setLoadingDistricts(true);
    const { data } = await getDistricts(stateCode, divisionCode);
    setLoadingDistricts(false);
    if (data) setDistricts(data);
  }, []);

  const fetchTalukas = useCallback(async (stateCode, divisionCode, districtCode) => {
    if (!stateCode || !divisionCode || !districtCode) return;
    setLoadingTalukas(true);
    const { data } = await getTalukas(stateCode, divisionCode, districtCode);
    setLoadingTalukas(false);
    if (data) setTalukas(data);
  }, []);

useEffect(() => {
  (async () => {
    setLoadingStates(true);
    try {
      const { data, error } = await getStates();
      setLoadingStates(false);

      if (error || !data) {
        Swal.fire(
          "Error",
          "Unable to load states. Please try again later.",
          "error"
        );
        return;
      }

      setStates(data);
    } catch (err) {
      setLoadingStates(false);
      Swal.fire(
        "Error",
        "Unable to load states due to server error.",
        "error"
      );
    }
  })();
}, []);





  const initialData = useMemo(() => {
    return (
      location.state || JSON.parse(localStorage.getItem("visitorData")) || {}
    );
  }, [location.state]);

  // Prefer backend photo_url, fallback to filename
  const [imagePreview, setImagePreview] = useState(
    initialData.photo_url
      ? initialData.photo_url
      : initialData.photo
      ? buildInitialImageUrl(initialData.photo)
      : ""
  );

  useEffect(() => {
    if (!initialData || (!initialData.user_id && !initialData.visitor_id)) {
      navigate("/profile");
    }
  }, [initialData, navigate]);

  // Image Upload Handler
// 

const handleSubmit = async (values) => {
  try {
    const visitorId = initialData.visitor_id;

    const formData = new FormData();
    formData.append("full_name", values.name);
    formData.append("gender", values.gender);
    formData.append("dob", values.dob);
    formData.append("mobile_no", values.phone);
    formData.append("email_id", values.email);

    formData.append("state_code", initialData.state_code || "");
    formData.append("division_code", initialData.division_code || "");
    formData.append("district_code", initialData.district_code || "");
    formData.append("taluka_code", initialData.taluka_code || "");
    formData.append("pincode", values.pincode);

    if (values.profilePic instanceof File) {
      formData.append("photo", values.profilePic);
    }

    const res = await updateVisitorProfile(visitorId, formData);

    if (res.data.success) {
      Swal.fire({
        icon: "success",
        title: "Profile Updated",
        text: "Your profile has been updated successfully.",
        confirmButtonColor: "#3085d6"
      });
    } else {
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: res.data.message || "Something went wrong.",
        confirmButtonColor: "#d33"
      });
    }
  } catch (err) {
    console.error(err);

    Swal.fire({
      icon: "error",
      title: "Update Failed",
      text:
        err.response?.data?.message ||
        "Please upload a valid image and try again.",
      confirmButtonColor: "#d33"
    });
  }
};


const handleImageUpload = (e, setFieldValue) => {
  const file = e.target.files?.[0];
  if (!file) return;

  const allowedMimeTypes = ["image/jpeg", "image/jpg", "image/png"];
  const allowedExtensions = [".jpg", ".jpeg", ".png"];
  const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();

  if (
    !allowedMimeTypes.includes(file.type) ||
    !allowedExtensions.includes(ext)
  ) {
    Swal.fire({
      icon: "error",
      title: "Invalid File",
      text: "Only JPG, JPEG, PNG images are allowed. PDF files are not allowed.",
      confirmButtonColor: "#d33"
    });

    e.target.value = "";
    return;
  }

  const maxSize = 200 * 1024; // 200 KB
  if (file.size > maxSize) {
    Swal.fire({
      icon: "warning",
      title: "File Too Large",
      text: "Image size must be less than 200 KB.",
      confirmButtonColor: "#f0ad4e"
    });

    e.target.value = "";
    return;
  }

  setImagePreview(URL.createObjectURL(file));
  setFieldValue("profilePic", file);
};
useEffect(() => {
  if (!visitor) return;

  if (visitor.state_code) {
    fetchDivisions(visitor.state_code);
  }

  if (visitor.state_code && visitor.division_code) {
    fetchDistricts(visitor.state_code, visitor.division_code);
  }

  if (
    visitor.state_code &&
    visitor.division_code &&
    visitor.district_code
  ) {
    fetchTalukas(
      visitor.state_code,
      visitor.division_code,
      visitor.district_code
    );
  }
}, [visitor, fetchDivisions, fetchDistricts, fetchTalukas]);


  return (
    <>
     <div className="fixed-header">
        <NavbarTop />
        <Header />
        <VisitorNavbar
  fullName={fullName}
  photo={visitor?.photo || visitor?.photo_url}
/>

      </div>

      <div className="main-layout">
        <div className="content-below">
   
    <div className="gov-edit-wrapper">
      <div className="gov-edit-container">
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ flex: 1 }}>
            <h1 className="gov-title">Edit Profile</h1>
            <p className="gov-subtitle">Update your profile details</p>
          </div>

          <div className="image-card">
            <div className="image-preview-wrap">
              {imagePreview ? (
                <img src={imagePreview} alt="Profile" className="image-preview" />
              ) : (
                <div className="image-placeholder">No photo</div>
              )}
            </div>
          </div>
        </div>

        <Formik
         initialValues={{
  name: initialData.full_name || "",
  phone: initialData.mobile_no || "",
  email: initialData.email_id || "",
  gender: initialData.gender || "",
  dob: formatDateForInput(initialData.dob),

  state: initialData.state_code || "",
  division: initialData.division_code || "",
  district: initialData.district_code || "",
  taluka: initialData.taluka_code || "",

  pincode: initialData.pincode || "",
  address: initialData.address || "",
  profilePic: null,
}}
enableReinitialize
onSubmit={handleSubmit}
validateOnChange={true}   // ✅ validate on every keystroke
validateOnBlur={true} 
validationSchema={ProfileSchema}
        >
         {({ values, setFieldValue, isValid }) => (

            <Form className="gov-form">
              {/* Image Upload */}
              <label className="image-upload-label">
                <input
  type="file"
  accept=".jpg,.jpeg,.png"
  onChange={(e) => handleImageUpload(e, setFieldValue)}
  className="hidden-file-input"
/>

                <span className="image-upload-btn">Upload Photo</span>
              </label>

              {imagePreview && (
                <button
                  type="button"
                  className="image-remove-btn"
                  onClick={() => {
                    setImagePreview("");
                    setFieldValue("profilePic", "");
                  }}
                >
                  Remove
                </button>
              )}

              {/* Personal Details */}
              <div className="gov-section">
                <h2 className="gov-section-title">Personal Details</h2>
                <div className="gov-grid">
                  <div className="gov-form-group">
                    <label>Visitor ID</label>
                    <input
                      value={initialData.visitor_id || initialData.user_id || ""}
                      readOnly
                    />
                  </div>

                  <div className="gov-form-group">
                    <label>Full Name</label>
                    <Field name="name" />
                    <ErrorMessage
                      name="name"
                      component="small"
                      className="field-error"
                    />
                  </div>

                  <div className="gov-form-group">
                    <label>Email</label>
                    <Field name="email" />
                    <ErrorMessage
                      name="email"
                      component="small"
                      className="field-error"
                    />
                  </div>

                  <div className="gov-form-group">
                    <label>Mobile No.</label>
                    <Field name="phone" maxLength="10" />
                    <ErrorMessage
                      name="phone"
                      component="small"
                      className="field-error"
                    />
                  </div>

                  <div className="gov-form-group">
                    <label>Gender</label>
                    <Field as="select" name="gender">
                      <option value="">Select</option>
                      <option value="M">Male</option>
                      <option value="F">Female</option>
                      <option value="O">Other</option>
                    </Field>
                    <ErrorMessage
                      name="gender"
                      component="small"
                      className="field-error"
                    />
                  </div>

                  <div className="gov-form-group">
                    <label>Date of Birth</label>
                    <Field type="date" name="dob" />
                    <ErrorMessage
                      name="dob"
                      component="small"
                      className="field-error"
                    />
                  </div>
                </div>
              </div>

              {/* Address Details */}
              <div className="gov-section">
                <h2 className="gov-section-title">Address Details</h2>
                <div className="gov-grid">
                  <div className="gov-form-group gov-fullwidth">
                    <label>Address</label>
                    <Field as="textarea" rows="3" name="address" />
                    <ErrorMessage
                      name="address"
                      component="small"
                      className="field-error"
                    />
                  </div>

                  {/* Names shown here, read-only */}
                  <div className="gov-form-group">
  <label>State</label>
  <Field
    as="select"
    name="state"
    onChange={async (e) => {
      const value = e.target.value;
      setFieldValue("state", value);
      setFieldValue("division", "");
      setFieldValue("district", "");
      setFieldValue("taluka", "");

      setDivisions([]);
      setDistricts([]);
      setTalukas([]);

      await fetchDivisions(value);
    }}
  >
    <option value="">Select State</option>
    {states.map((s) => (
      <option key={s.state_code} value={s.state_code}>
        {s.state_name}
      </option>
    ))}
  </Field>
</div>

                  <div className="gov-form-group">
  <label>Division</label>
  <Field
    as="select"
    name="division"
    onChange={async (e) => {
      const value = e.target.value;
      setFieldValue("division", value);
      setFieldValue("district", "");
      setFieldValue("taluka", "");

      setDistricts([]);
      setTalukas([]);

      await fetchDistricts(values.state, value);
    }}
    disabled={!values.state}
  >
    <option value="">Select Division</option>
    {divisions.map((d) => (
      <option key={d.division_code} value={d.division_code}>
        {d.division_name}
      </option>
    ))}
  </Field>
</div>

                 <div className="gov-form-group">
  <label>District</label>
  <Field
    as="select"
    name="district"
    onChange={async (e) => {
      const value = e.target.value;
      setFieldValue("district", value);
      setFieldValue("taluka", "");

      setTalukas([]);
      await fetchTalukas(values.state, values.division, value);
    }}
    disabled={!values.division}
  >
    <option value="">Select District</option>
    {districts.map((d) => (
      <option key={d.district_code} value={d.district_code}>
        {d.district_name}
      </option>
    ))}
  </Field>
</div>

                  <div className="gov-form-group">
  <label>Taluka</label>
  <Field
    as="select"
    name="taluka"
    disabled={!values.district}
  >
    <option value="">Select Taluka</option>
    {talukas.map((t) => (
      <option key={t.taluka_code} value={t.taluka_code}>
        {t.taluka_name}
      </option>
    ))}
  </Field>
</div>

                  <div className="gov-form-group">
                    <label>Pincode</label>
                    <Field name="pincode" maxLength="6" />
                    <ErrorMessage
                      name="pincode"
                      component="small"
                      className="field-error"
                    />
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="gov-btn-row">
                <button
                  type="submit"
                  className="gov-btn-primary"
                  disabled={!isValid}
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  className="gov-btn-secondary"
                  onClick={() => navigate("/profile")}
                >
                  Cancel
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
    </div>
    </div>
    </>
  );
}