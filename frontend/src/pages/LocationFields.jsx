import React from "react";

const LocationFields = ({
   title,
  mode = "edit",
  values,
  onChange,

  // 🔥 NEW
  showPhoto = false,
  photo,
  onCapturePhoto,

  states,
  divisions,
  districts,
  talukas,
  loadingStates,
  loadingDivisions,
  loadingDistricts,
  loadingTalukas,
  renderOptions
}) => {
  const disabled = mode === "readonly";

  return (
    <div className="panel-section">
      {title && <div className="section-title">{title}</div>}

      {/* ================= BASIC DETAILS ================= */}
      <div className="grid-4">
        <div className="form-field">
          <label>Full Name *</label>
          <input
            name="full_name"
            value={values.full_name || ""}
            onChange={onChange}
            disabled={disabled}
          />
        </div>

        <div className="form-field">
          <label>Gender *</label>
          <select
            name="gender"
            value={values.gender || ""}
            onChange={onChange}
            disabled={disabled}
          >
            <option value="">Select</option>
            <option value="M">Male</option>
            <option value="F">Female</option>
            <option value="O">Other</option>
          </select>
        </div>

        <div className="form-field">
          <label>Date of Birth</label>
          <input
            type="date"
            name="dob"
            value={values.dob || ""}
            onChange={onChange}
            disabled={disabled}
          />
        </div>

        <div className="form-field">
          <label>Mobile No *</label>
          <input
            name="mobile_no"
            value={values.mobile_no || ""}
            onChange={onChange}
            disabled={disabled}
          />
        </div>

        <div className="form-field">
          <label>Email ID</label>
          <input
            name="email_id"
            value={values.email_id || ""}
            onChange={onChange}
            disabled={disabled}
          />
        </div>

        <div className="form-field">
          <label>Pincode *</label>
          <input
            name="pincode"
            value={values.pincode || ""}
            onChange={onChange}
            disabled={disabled}
          />
        </div>
      </div>

      {/* ================= LOCATION DETAILS ================= */}
      <div className="grid-4">
        {/* State */}
        <div className="form-field">
          <label>State *</label>
          <select
            name="state"
            value={values.state || ""}
            onChange={onChange}
            disabled={disabled}
          >
            <option value="">
              {loadingStates ? "Loading..." : "Select State"}
            </option>
            {renderOptions(states, "state_code", "state_name")}
          </select>
        </div>

        {/* Division */}
        <div className="form-field">
          <label>Division</label>
          <select
            name="division"
            value={values.division || ""}
            onChange={onChange}
            disabled={disabled || !values.state}
          >
            <option value="">
              {loadingDivisions ? "Loading..." : "Select Division"}
            </option>
            {renderOptions(divisions, "division_code", "division_name")}
          </select>
        </div>

        {/* District */}
        <div className="form-field">
          <label>District</label>
          <select
            name="district"
            value={values.district || ""}
            onChange={onChange}
            disabled={disabled || !values.division}
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
            value={values.taluka || ""}
            onChange={onChange}
            disabled={disabled || !values.district}
          >
            <option value="">
              {loadingTalukas ? "Loading..." : "Select Taluka"}
            </option>
            {renderOptions(talukas, "taluka_code", "taluka_name")}
          </select>
        </div>
       

      </div>
      {showPhoto && (
  <div className="grid-4">
    <div className="form-field">
      <label>Live Photo *</label>

      {!photo ? (
        <button type="button" onClick={onCapturePhoto}>
          Capture Photo
        </button>
      ) : (
        <div className="photo-preview">
          <img
            src={URL.createObjectURL(photo)}
            alt="Visitor"
            style={{ width: "120px", borderRadius: "8px" }}
          />
          <button
            type="button"
            onClick={onCapturePhoto}
            style={{ marginTop: "6px" }}
          >
            Retake Photo
          </button>
        </div>
      )}
    </div>
  </div>
)}

    </div>
  );
};

export default LocationFields;
