import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { toast } from "react-toastify";
import "../css/EditProfile.css";
import {updateVisitorProfile} from "../services/api"

// --------------------------
// Validation schema
// --------------------------
const ProfileSchema = Yup.object().shape({
  name: Yup.string().min(3, "Too short").required("Full name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  phone: Yup.string()
    .matches(/^\d{10}$/, "Mobile must be 10 digits")
    .required("Mobile number is required"),
  gender: Yup.string().required("Gender is required"),
  dob: Yup.string().required("DOB is required"),
  // address: Yup.string().min(5).required("Address required"),
  state: Yup.string().required("State required"),
  division: Yup.string().required("Division required"),
  // district: Yup.string().required("District required"),
  // taluka: Yup.string().required("Taluka required"),
  pincode: Yup.string()
    .matches(/^\d{6}$/, "Pincode must be 6 digits")
    .required("Pincode required"),
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
      toast.success("Profile updated successfully!");
    } else {
      toast.error(res.data.message);
    }
  } catch (err) {
    console.error(err);
    toast.error("Update failed");
  }
};


const handleImageUpload = (e, setFieldValue) => {
  const file = e.target.files?.[0];
  if (!file) return;

  setImagePreview(URL.createObjectURL(file));
  setFieldValue("profilePic", file);
};


  // Submit handler
  // const updateVisitorProfile = async (values) => {
  //   try {
  //     const id = initialData.visitor_id || initialData.user_id;

  //     const mappedData = {
  //       full_name: values.name,
  //       gender: values.gender,
  //       dob: values.dob, // yyyy-MM-dd
  //       mobile_no: values.phone,
  //       email_id: values.email,

  //       // Always send codes from initialData (user can't change location here)
  //       state_code: initialData.state_code || "",
  //       division_code: initialData.division_code || "",
  //       district_code: initialData.district_code || "",
  //       taluka_code: initialData.taluka_code || "",

  //       pincode: values.pincode,
  //       address: values.address,

  //       // new base64 if changed, else keep existing filename
  //       photo: values.profilePic || initialData.photo || null,
  //     };

  //     const res = await axios.put(
  //       `http://localhost:5000/api/visitor/profile/${id}`,
  //       mappedData
  //     );

  //     console.log("Update response:", res.data);

  //     if (res.data?.success) {
  //       const updatedProfile = res.data.data || { ...initialData, ...mappedData };

  //       localStorage.setItem("visitorData", JSON.stringify(updatedProfile));

  //       toast.success("Profile updated successfully!");
  //       setTimeout(() => navigate("/profile"), 1200);
  //     } else {
  //       toast.error(res.data?.message || "Update failed. Try again.");
  //     }
  //   } catch (err) {
  //     console.error("Error updating visitor profile:", err);
  //     toast.error("Update failed. Try again.");
  //   }
  // };

  return (
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
            ...initialData,
            name: initialData.full_name || "",
            phone: initialData.mobile_no || "",
            email: initialData.email_id || "",
            // show NAMES here, not codes
            state: initialData.state_name || initialData.state_code || "",
            division:
              initialData.division_name || initialData.division_code || "",
            district:
              initialData.district_name || initialData.district_code || "",
            taluka: initialData.taluka_name || initialData.taluka_code || "",
            pincode: initialData.pincode || "",
            address: initialData.address || "",
            dob: formatDateForInput(initialData.dob),
            gender: initialData.gender || "",
            profilePic: null,

          }}
          enableReinitialize
          validationSchema={ProfileSchema}
           onSubmit={handleSubmit}
        >
          {({ setFieldValue, isValid }) => (
            <Form className="gov-form">
              {/* Image Upload */}
              <label className="image-upload-label">
                <input
                  type="file"
                  accept="image/*"
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
                    <Field name="state" readOnly />
                    <ErrorMessage
                      name="state"
                      component="small"
                      className="field-error"
                    />
                  </div>

                  <div className="gov-form-group">
                    <label>Division</label>
                    <Field name="division" readOnly />
                    <ErrorMessage
                      name="division"
                      component="small"
                      className="field-error"
                    />
                  </div>

                  <div className="gov-form-group">
                    <label>District</label>
                    <Field name="district" readOnly />
                    <ErrorMessage
                      name="district"
                      component="small"
                      className="field-error"
                    />
                  </div>

                  <div className="gov-form-group">
                    <label>Taluka</label>
                    <Field name="taluka" readOnly />
                    <ErrorMessage
                      name="taluka"
                      component="small"
                      className="field-error"
                    />
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
  );
}