import React, { useEffect, useState, useCallback } from "react";
import Swal from "sweetalert2";
import "../css/HolidayConfig.css";

import {
  getSlotHolidays,
  getSlotHolidayById,
  createSlotHoliday,
  deactivateSlotHoliday,
  updateSlotHoliday,
  getStates,
  getDivisions,
  getDistricts,
  getTalukas,
  getOrganizationbyLocation,
  getDepartment,
  getServices,
} from "../services/api";

import "../css/HolidayConfig.css";

const HolidayConfig = () => {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Dropdown data
// Location
const [states, setStates] = useState([]);
const [divisions, setDivisions] = useState([]);
const [districts, setDistricts] = useState([]);
const [talukas, setTalukas] = useState([]);
const [isEditingLoading, setIsEditingLoading] = useState(false);

// Org
const [organizations, setOrganizations] = useState([]);
const [departments, setDepartments] = useState([]);
const [services, setServices] = useState([]);
const [isEditMode, setIsEditMode] = useState(false);
const [editHolidayId, setEditHolidayId] = useState(null);


  // Selected values
  const [form, setForm] = useState({
    state_code: "",
    division_code: "",
    district_code: "",
    taluka_code: "",
    organization_id: "",
    department_id: "",
    service_id: "",
    holiday_date: "",
    description: "",
  });

  // ------------------ Fetch Holidays ------------------
  const fetchHolidays = async () => {
    setLoading(true);
    try {
      const res = await getSlotHolidays();


      const holidaysArray = Array.isArray(res?.data?.data) ? res.data.data : [];
      setHolidays(holidaysArray);
    } catch (err) {
      console.error("Fetch holidays error:", err);
      setHolidays([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHolidays();
  }, []);

  // ------------------ Fetch Location & Org Dropdowns ------------------
  useEffect(() => {
  const fetchStates = async () => {
    const { data } = await getStates();
    setStates(data || []);
  };
  fetchStates();
}, []);

useEffect(() => {
  if (!form.state_code) return;

  // ❌ REMOVE isEditMode guard
  getOrganizationbyLocation({
    state_code: form.state_code,
    division_code: form.division_code || null,
    district_code: form.district_code || null,
    taluka_code: form.taluka_code || null,
  }).then(res => setOrganizations(res.data || []));
}, [
  form.state_code,
  form.division_code,
  form.district_code,
  form.taluka_code
]);





const formatDateForInput = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};


const fetchDivisions = useCallback(async (state) => {
  if (!state) return;
  const { data } = await getDivisions(state);
  setDivisions(data || []);
}, []);

const fetchDistricts = useCallback(async (state, division) => {
  if (!state || !division) return;
  const { data } = await getDistricts(state, division);
  setDistricts(data || []);
}, []);

const fetchTalukas = useCallback(async (state, division, district) => {
  if (!state || !division || !district) return;
  const { data } = await getTalukas(state, division, district);
  setTalukas(data || []);
}, []);


const fetchDepartments = useCallback(async (orgId) => {
  const { data } = await getDepartment(orgId);
  setDepartments(data || []);
}, []);

const fetchServices = useCallback(async (orgId, deptId) => {
  const res = await getServices(orgId, deptId);
  setServices(res.data || []);
}, []);


  // ------------------ Handle Form Changes ------------------
const handleChange = (e) => {
  const { name, value } = e.target;

  setForm((prev) => {
    let updated = { ...prev, [name]: value };

    // -------- STATE CHANGE --------
    if (name === "state_code") {
      updated.division_code = "";
      updated.district_code = "";
      updated.taluka_code = "";
      updated.organization_id = "";
      updated.department_id = "";
      updated.service_id = "";

      setDivisions([]);
      setDistricts([]);
      setTalukas([]);
      setDepartments([]);
      setServices([]);

      if (value) {
        fetchDivisions(value); // ✅ THIS WAS MISSING
      }
    }

    // -------- DIVISION CHANGE --------
    if (name === "division_code") {
      updated.district_code = "";
      updated.taluka_code = "";
      if (value) {
        fetchDistricts(prev.state_code, value);
      }
    }

    // -------- DISTRICT CHANGE --------
    if (name === "district_code") {
      updated.taluka_code = "";
      if (value) {
        fetchTalukas(prev.state_code, prev.division_code, value);
      }
    }

    // -------- ORGANIZATION CHANGE --------
    if (name === "organization_id") {
      updated.department_id = "";
      updated.service_id = "";
      setDepartments([]);
      setServices([]);
      if (value) {
        fetchDepartments(value);
      }
    }

    // -------- DEPARTMENT CHANGE --------
    if (name === "department_id") {
      updated.service_id = "";
      if (value) {
        fetchServices(prev.organization_id, value);
      }
    }

    return updated;
  });
};

const normalizePayload = (obj) => {
  const cleaned = {};
  Object.keys(obj).forEach((k) => {
    cleaned[k] = obj[k] === "" ? null : obj[k];
  });
  return cleaned;
};



  // ------------------ Save Holiday ------------------
  const saveHoliday = async () => {
  if (!form.holiday_date || !form.description) {
    Swal.fire("Validation", "Please provide date and description", "warning");
    return;
  }

  const payload = normalizePayload(form);
  setSaving(true);

  try {
    if (isEditMode) {
      await updateSlotHoliday(editHolidayId, payload);

      Swal.fire("Updated", "Holiday updated successfully", "success");
    } else {
      const res = await createSlotHoliday(payload);
      if (!res.data?.holiday_id) throw new Error();
      Swal.fire("Success", "Holiday created successfully", "success");
    }

    // reset
    setForm({
      state_code: "",
      division_code: "",
      district_code: "",
      taluka_code: "",
      organization_id: "",
      department_id: "",
      service_id: "",
      holiday_date: "",
      description: "",
    });

    setIsEditMode(false);
    setEditHolidayId(null);
    fetchHolidays();
  } catch (err) {
    console.error(err);
    Swal.fire("Error", "Operation failed", "error");
  } finally {
    setSaving(false);
  }
};



  // ------------------ Deactivate Holiday ------------------
  const handleDeactivate = async (holiday_id) => {
    const confirm = await Swal.fire({
      title: "Deactivate Holiday?",
      text: "This holiday will be disabled",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, deactivate",
      cancelButtonText: "Cancel",
    });

    if (confirm.isConfirmed) {
      try {
        await deactivateSlotHoliday(holiday_id);
        Swal.fire("Deactivated", "Holiday has been deactivated", "success");
        fetchHolidays();
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "Failed to deactivate holiday", "error");
      }
    }
  };

const handleEdit = async (holiday_id) => {
  try {
    setIsEditMode(true);
    setIsEditingLoading(true);
    setEditHolidayId(holiday_id);

    /* 1️⃣ FETCH HOLIDAY DETAILS FROM DB */
    const res = await getSlotHolidayById(holiday_id);
    const holiday = res?.data?.data;

    if (!holiday) {
      Swal.fire("Error", "Holiday not found", "error");
      return;
    }

    /* 2️⃣ LOAD LOCATION DROPDOWNS */
    if (holiday.state_code) {
      const divRes = await getDivisions(holiday.state_code);
      setDivisions(divRes.data || []);
    }

    if (holiday.state_code && holiday.division_code) {
      const distRes = await getDistricts(
        holiday.state_code,
        holiday.division_code
      );
      setDistricts(distRes.data || []);
    }

    if (
      holiday.state_code &&
      holiday.division_code &&
      holiday.district_code
    ) {
      const talRes = await getTalukas(
        holiday.state_code,
        holiday.division_code,
        holiday.district_code
      );
      setTalukas(talRes.data || []);
    }

    /* 3️⃣ LOAD ORGANIZATION */
    if (holiday.state_code) {
      const orgRes = await getOrganizationbyLocation({
        state_code: holiday.state_code,
        division_code: holiday.division_code || null,
        district_code: holiday.district_code || null,
        taluka_code: holiday.taluka_code || null,
      });
      setOrganizations(orgRes.data || []);
    }

    /* 4️⃣ LOAD DEPARTMENT */
    if (holiday.organization_id) {
      const deptRes = await getDepartment(holiday.organization_id);
      setDepartments(deptRes.data || []);
    }

    /* 5️⃣ LOAD SERVICES */
    if (holiday.organization_id && holiday.department_id) {
      const srvRes = await getServices(
        holiday.organization_id,
        holiday.department_id
      );
      setServices(srvRes.data || []);
    }

    /* 6️⃣ SET FORM AFTER OPTIONS EXIST */
    setForm({
      state_code: holiday.state_code?.toString() || "",
      division_code: holiday.division_code?.toString() || "",
      district_code: holiday.district_code?.toString() || "",
      taluka_code: holiday.taluka_code?.toString() || "",
      organization_id: holiday.organization_id?.toString() || "",
      department_id: holiday.department_id?.toString() || "",
      service_id: holiday.service_id?.toString() || "",
      holiday_date: formatDateForInput(holiday.holiday_date),
      description: holiday.description || "",
    });

    Swal.fire("Edit Mode", "Holiday loaded for editing", "info");
  } catch (err) {
    console.error("Edit load failed:", err);
    Swal.fire("Error", "Failed to load holiday", "error");
  } finally {
    setIsEditingLoading(false);
  }
};






  // ------------------ Render Options ------------------
  const renderOptions = (list, key, label) =>
    list.map((i) => (
      <option key={i[key]} value={i[key]}>
        {i[label]}
      </option>
    ));

  return (
    <div className="holiday-config">
      <h2>📅 Holiday Configuration</h2>

      {/* ----------------- Form ----------------- */}
      <div className="holiday-form card">
        <h3>Add New Holiday</h3>
        <div className="form-row">

  {/* STATE */}
  
  <select
  name="state_code"
  value={form.state_code}
  onChange={handleChange}
  disabled={isEditMode}
>
  <option value="">Select State</option>
  {states.map(s => (
    <option key={s.state_code} value={String(s.state_code)}>
      {s.state_name}
    </option>
  ))}
</select>


  {/* DIVISION */}
  <select
    name="division_code"
    value={form.division_code}
    onChange={handleChange}
    disabled={(isEditMode && !isEditingLoading) || !form.state_code}
  >
    <option value="">Select Division</option>
    {divisions.map(d => (
      <option key={d.division_code} value={String(d.division_code)}>
        {d.division_name}
      </option>
    ))}
  </select>

  {/* DISTRICT */}
  <select
    name="district_code"
    value={form.district_code}
    onChange={handleChange}
    disabled={(isEditMode && !isEditingLoading) ||!form.division_code}
  >
    <option value="">Select District</option>
    {districts.map(d => (
      <option key={d.district_code} value={String(d.district_code)}>
        {d.district_name}
      </option>
    ))}
  </select>

  {/* TALUKA */}
  <select
    name="taluka_code"
    value={form.taluka_code}
    onChange={handleChange}
    disabled={(isEditMode && !isEditingLoading) ||!form.district_code}
  >
    <option value="">Select Taluka</option>
    {talukas.map(t => (
      <option key={t.taluka_code} value={String(t.taluka_code)}>
        {t.taluka_name}
      </option>
    ))}
  </select>

  {/* ORGANIZATION */}
  <select
  name="organization_id"
  value={form.organization_id}
  onChange={handleChange}
  disabled={(isEditMode && !isEditingLoading) ||!form.state_code}
>

    <option value="">Select Organization</option>
    {organizations.map(o => (
      <option key={o.organization_id} value={String(o.organization_id)}>
        {o.organization_name}
      </option>
    ))}
  </select>

  {/* DEPARTMENT */}
  <select
    name="department_id"
    value={form.department_id}
    onChange={handleChange}
    disabled={(isEditMode && !isEditingLoading) ||!form.organization_id}
  >
    <option value="">Select Department</option>
    {departments.map(d => (
      <option key={d.department_id} value={String(d.department_id)}>
        {d.department_name}
      </option>
    ))}
  </select>

  {/* SERVICE */}
  <select
    name="service_id"
    value={form.service_id}
    onChange={handleChange}
    disabled={(isEditMode && !isEditingLoading) ||!form.department_id}
  >
    <option value="">Select Service</option>
    {services.map(s => (
      <option key={s.service_id} value={String(s.service_id)}>
        {s.service_name}
      </option>
    ))}
  </select>

          <input type="date" name="holiday_date" value={form.holiday_date} onChange={handleChange} />
          <input type="text" name="description" placeholder="Holiday Description" value={form.description} onChange={handleChange} />
        </div>

<button className="btn-primary" onClick={saveHoliday} disabled={saving}>
  {saving
    ? "Saving..."
    : isEditMode
    ? "Update Holiday"
    : "Add Holiday"}
</button>

{isEditMode && (
  <button
    className="btn-secondary ml-2"
    onClick={() => {
      setIsEditMode(false);
      setEditHolidayId(null);
      setForm({
        state_code: "",
        division_code: "",
        district_code: "",
        taluka_code: "",
        organization_id: "",
        department_id: "",
        service_id: "",
        holiday_date: "",
        description: "",
      });
    }}
  >
    Cancel
  </button>
)}



      </div>

      {/* ----------------- Holiday Table ----------------- */}
      <div className="holiday-table card mt-4">
        <h3>Configured Holidays</h3>
        {loading ? (
          <p>Loading holidays...</p>
        ) : holidays.length === 0 ? (
          <p>No holidays configured yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>State</th>
                <th>Division</th>
                <th>District</th>
                <th>Taluka</th>
                <th>Organization</th>
                <th>Department</th>
                <th>Service</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {holidays.map((h) => (
                <tr key={h.holiday_id}>
                  <td>{new Date(h.holiday_date).toLocaleDateString()}</td>
                  <td>{h.description}</td>
                  <td>{h.state_name || "All"}</td>
                  <td>{h.division_name || "All"}</td>
                  <td>{h.district_name || "All"}</td>
                  <td>{h.taluka_name || "All"}</td>
                  <td>{h.organization_name || "All"}</td>
                  <td>{h.department_name || "All"}</td>
                  <td>{h.service_name || "All"}</td>
                  <td>{h.is_active ? "Active" : "Inactive"}</td>
                  <td>
  {h.is_active && (
    <>
      <button
        className="btn-warning"
        onClick={() => handleEdit(h.holiday_id)}
      >
        Edit
      </button>

      <button
        className="btn-danger ml-2"
        onClick={() => handleDeactivate(h.holiday_id)}
      >
        Deactivate
      </button>
    </>
  )}

                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default HolidayConfig;
