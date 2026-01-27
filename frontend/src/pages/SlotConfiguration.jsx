import React, { useEffect, useState } from "react";
import "../css/SlotConfiguration.css";
import Swal from "sweetalert2";
import {
  getStates,
  getDivisions,
  getDistricts,
  getTalukas,
  getOrganizationbyLocation,
  getDepartment,
  getServices,
  getSlotConfigs,
  getOfficersByLocation,
  createSlotConfig,
  deactivateSlotConfig,
  updateSlotConfig
} from "../services/api";

/* ISO DOW mapping */
const DAYS = [
  { label: "MON", value: 1 },
  { label: "TUE", value: 2 },
  { label: "WED", value: 3 },
  { label: "THU", value: 4 },
  { label: "FRI", value: 5 },
  { label: "SAT", value: 6 },
  { label: "SUN", value: 7 },
];
const normalizeDate = (d) => d ? d.slice(0, 10) : "";
const DAY_LABEL = {
  1: "MON",
  2: "TUE",
  3: "WED",
  4: "THU",
  5: "FRI",
  6: "SAT",
  7: "SUN",
};


const SlotConfiguration = () => {
  /* ================= MASTER DATA ================= */
  const [states, setStates] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [talukas, setTalukas] = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [services, setServices] = useState([]);
  const [isEditingLoading, setIsEditingLoading] = useState(false);
  const [officers, setOfficers] = useState([]);
  const [officersLoading, setOfficersLoading] = useState(false);

  /* ================= FORM ================= */
  const [form, setForm] = useState({
    state_code: "",
    division_code: "",
    district_code: "",
    taluka_code: "",
    org_id: "",
    dept_id: "",
    service_id: "",
    officer_id: "",
    days_of_week: [],
    start_time: "09:00",
    end_time: "17:00",
    slot_minutes: 15,
    buffer_minutes: 0,
    capacity_per_slot: 1,
    effective_from: "",
    effective_to: "",
  });

  const [isEditMode, setIsEditMode] = useState(false);
  const [editingId, setEditingId] = useState(null);

  /* ================= OTHER STATE ================= */
  const [breaks] = useState([]);
  const [previewSlots, setPreviewSlots] = useState([]);
  const [configs, setConfigs] = useState([]);
  const filteredConfigs = configs.filter(c => {
  if (form.state_code && c.state_code !== form.state_code) return false;
  if (form.division_code && c.division_code !== form.division_code) return false;
  if (form.district_code && c.district_code !== form.district_code) return false;
  if (form.taluka_code && c.taluka_code !== form.taluka_code) return false;
  return true;
});
  /* ================= INITIAL LOAD ================= */
  useEffect(() => {
    getStates().then(res => setStates(res.data || []));
    loadConfigs();
  }, []);

  const loadConfigs = () => {
    getSlotConfigs().then(res => setConfigs(res.data || []));
  };

  /* ================= CASCADE LOGIC ================= */

useEffect(() => {
  if (isEditMode && isEditingLoading) return;
  if (!form.state_code) return;

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
  form.taluka_code,
  isEditMode,
  isEditingLoading
]);


useEffect(() => {
  if (isEditMode && isEditingLoading) return;
  if (!form.state_code) return;

  getDivisions(form.state_code)
    .then(res => setDivisions(res.data || []));
}, [form.state_code, isEditMode, isEditingLoading]);

 useEffect(() => {
  if (isEditMode && isEditingLoading) return;
  if (!form.division_code) return;

  getDistricts(form.state_code, form.division_code)
    .then(res => setDistricts(res.data || []));
}, [form.division_code, isEditMode, isEditingLoading]);


useEffect(() => {
  if (isEditMode && isEditingLoading) return;
  if (!form.district_code) return;

  getTalukas(form.state_code, form.division_code, form.district_code)
    .then(res => setTalukas(res.data || []));
}, [form.district_code, isEditMode, isEditingLoading]);

console.log(form.officer_id,"officerId")
  useEffect(() => {
    if (!form.org_id) return;

    getDepartment(form.org_id)
      .then(res => setDepartments(res.data || []));
  }, [form.org_id]);

  useEffect(() => {
    if (!form.org_id || !form.dept_id) return;

    getServices(form.org_id, form.dept_id)
      .then(res => setServices(res.data || []));
  }, [form.dept_id]);

useEffect(() => {
  if (!form.state_code) return;

  setOfficersLoading(true);

  getOfficersByLocation({
    state_code: form.state_code,
    division_code: form.division_code || null,
    district_code: form.district_code || null,
    taluka_code: form.taluka_code || null,
    organization_id: form.org_id || null,
    department_id: form.dept_id || null
  })
    .then(res => {
      const allOfficers = res.data?.data || [];

      // ❌ Exclude Helpdesk officers
      const filteredOfficers = allOfficers.filter(
        o => o.officer_type !== "HELPDESK"
      );

      setOfficers(filteredOfficers);
    })
    .finally(() => setOfficersLoading(false));
}, [
  form.state_code,
  form.division_code,
  form.district_code,
  form.taluka_code,
  form.org_id,
  form.dept_id
]);






  /* ================= HANDLERS ================= */

  const handleChange = (e) => {
  if (isEditMode && isEditingLoading) return;

  const { name, value } = e.target;

  setForm(prev => {
    const updated = { ...prev, [name]: value };

    if (name === "state_code") {
      updated.division_code = "";
      updated.district_code = "";
      updated.taluka_code = "";
      updated.org_id = "";
      updated.dept_id = "";
      updated.service_id = "";
      setDivisions([]);
      setDistricts([]);
      setTalukas([]);
      setOfficers([]);
    }

    if (name === "division_code") {
      updated.district_code = "";
      updated.taluka_code = "";
      setDistricts([]);
      setTalukas([]);
    }

    if (name === "district_code") {
      updated.taluka_code = "";
      setTalukas([]);

    }

    if (name === "org_id") {
      updated.dept_id = "";
      updated.service_id = "";
      setDepartments([]);
      setServices([]);
    }

    if (name === "dept_id") {
      updated.service_id = "";
      setServices([]);
    }

    return updated;
  });
};


  const toggleDay = (day) => {
    setForm(prev => ({
      ...prev,officer_id: "",
      days_of_week: prev.days_of_week.includes(day)
        ? prev.days_of_week.filter(d => d !== day)
        : [...prev.days_of_week, day],
    }));
  };

  /* ================= SLOT PREVIEW ================= */

  const generatePreview = () => {
    let slots = [];
    let start = new Date(`1970-01-01T${form.start_time}`);
    let end = new Date(`1970-01-01T${form.end_time}`);

    while (start < end) {
      let next = new Date(start.getTime() + form.slot_minutes * 60000);

      if (next <= end) {
        slots.push(
          `${start.toTimeString().slice(0, 5)} - ${next.toTimeString().slice(0, 5)}`
        );
      }

      start = new Date(next.getTime() + form.buffer_minutes * 60000);
    }

    setPreviewSlots(slots);
  };

  /* ================= CONFLICT CHECK ================= */

  const toMinutes = (t) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  };

  const detectConflict = (day) => {
    

    const newStart = toMinutes(form.start_time);
    const newEnd = toMinutes(form.end_time);

    return configs.some(c => {
      if (isEditMode && c.slot_config_id === editingId) return false;
      if (!c.is_active) return false;
      if (c.day_of_week !== day) return false;
      if (c.organization_id !== form.org_id) return false;
      if (c.state_code !== form.state_code) return false;
      if (c.department_id !== form.dept_id) return false;
      if (c.division_code !== form.division_code) return false;
      if (c.district_code !== form.district_code) return false;
      if (c.taluka_code !== form.taluka_code) return false;
      if (c.service_id !== form.service_id) return false;
      if (c.officer_id !== form.officer_id) return false;

      const s = toMinutes(c.start_time);
      const e = toMinutes(c.end_time);

      return newStart < e && newEnd > s;
    });
  };

  /* ================= SAVE ================= */

  const save = async () => {
  if (form.days_of_week.length === 0) {
    Swal.fire("Validation", "Select at least one day", "warning");
    return;
  }

  try {
    if (isEditMode) {
  await updateSlotConfig({
    slot_config_id: editingId,

    organization_id: form.org_id,
    department_id: form.dept_id || null,
    service_id: form.service_id || null,
    officer_id: form.officer_id || null,

    state_code: form.state_code,
    division_code: form.division_code || null,
    district_code: form.district_code || null,
    taluka_code: form.taluka_code || null,

    day_of_week: form.days_of_week[0], // SINGLE DAY

    start_time: form.start_time,
    end_time: form.end_time,
    slot_duration_minutes: Number(form.slot_minutes),
    buffer_minutes: Number(form.buffer_minutes),
    max_capacity: Number(form.capacity_per_slot),

    effective_from: form.effective_from,
    effective_to: form.effective_to || null,
  });

  Swal.fire("Updated", "Slot configuration updated", "success");
}
 else {
      for (const day of form.days_of_week) {
        if (detectConflict(day)) {
          Swal.fire("Conflict", `Slot already exists for day ${day}`, "warning");
          return;
        }

        await createSlotConfig({
          organization_id: form.org_id,
          department_id: form.dept_id || null,
          service_id: form.service_id || null,
          officer_id: form.officer_id || null,

          state_code: form.state_code,
          division_code: form.division_code || null,
          district_code: form.district_code || null,
          taluka_code: form.taluka_code || null,

          day_of_week: day,
          start_time: form.start_time,
          end_time: form.end_time,
          slot_duration_minutes: Number(form.slot_minutes),
          buffer_minutes: Number(form.buffer_minutes),
          max_capacity: Number(form.capacity_per_slot),
          effective_from: form.effective_from,
          effective_to: form.effective_to || null,
        });
      }

      Swal.fire("Success", "Slot configuration saved", "success");
    }

    resetForm();
    loadConfigs();
  } catch {
    Swal.fire("Error", "Operation failed", "error");
  }
};

const resetForm = () => {
  setIsEditMode(false);
  setEditingId(null);
  setIsEditingLoading(false);
  setPreviewSlots([]);

  setForm({
    state_code: "",
    division_code: "",
    district_code: "",
    taluka_code: "",
    org_id: "",
    dept_id: "",
    service_id: "",
    officer_id: "",
    days_of_week: [],
    start_time: "09:00",
    end_time: "17:00",
    slot_minutes: 15,
    buffer_minutes: 0,
    capacity_per_slot: 1,
    effective_from: "",
    effective_to: "",
  });
};



  /* ================= DEACTIVATE ================= */

  const deactivate = async (id) => {
    const confirm = await Swal.fire({
      title: "Deactivate?",
      text: "This slot config will be disabled",
      icon: "warning",
      showCancelButton: true,
    });

    if (confirm.isConfirmed) {
      await deactivateSlotConfig(id);
      loadConfigs();
    }
  };

const handleEdit = async (config) => {
  setIsEditMode(true);
  setEditingId(config.slot_config_id);
  setIsEditingLoading(true);
  setPreviewSlots([]);

  // Load location hierarchy
  const divRes = await getDivisions(config.state_code);
  const distRes = config.division_code
    ? await getDistricts(config.state_code, config.division_code)
    : { data: [] };
  const talRes = config.district_code
    ? await getTalukas(
        config.state_code,
        config.division_code,
        config.district_code
      )
    : { data: [] };

  setDivisions(divRes.data || []);
  setDistricts(distRes.data || []);
  setTalukas(talRes.data || []);
  const normalizeTime = (t) => t ? t.slice(0, 5) : "";
  // Load org hierarchy
  const orgRes = await getOrganizationbyLocation({
    state_code: config.state_code,
    division_code: config.division_code,
    district_code: config.district_code,
    taluka_code: config.taluka_code,
  });
  setOrganizations(orgRes.data || []);

  const deptRes = config.organization_id
    ? await getDepartment(config.organization_id)
    : { data: [] };
  setDepartments(deptRes.data || []);

  const srvRes =
    config.organization_id && config.department_id
      ? await getServices(config.organization_id, config.department_id)
      : { data: [] };
  setServices(srvRes.data || []);

  // FINAL atomic form set
  setForm({
    state_code: config.state_code,
    division_code: config.division_code || "",
    district_code: config.district_code || "",
    taluka_code: config.taluka_code || "",
    org_id: config.organization_id,
    dept_id: config.department_id || "",
    service_id: config.service_id || "",
    officer_id: config.officer_id || "",
    days_of_week: [config.day_of_week],
    start_time: normalizeTime(config.start_time),
    end_time: normalizeTime(config.end_time),
    slot_minutes: config.slot_duration_minutes,
    buffer_minutes: config.buffer_minutes,
    capacity_per_slot: config.max_capacity,
    effective_from: normalizeDate(config.effective_from),
    effective_to: normalizeDate(config.effective_to) || "",
  });

  setIsEditingLoading(false);

  Swal.fire("Edit Mode", "Slot loaded for editing", "info");
};



  /* ================= UI ================= */

  return (
    <div className="slot-page">
      <h2>Slot Configuration</h2>

      <section className="card">
        <h4>Slot Setup</h4>

        <div className="grid-4">
          <div className="form-group">
  <label>State</label>
          <select
  name="state_code"
  value={form.state_code}
  onChange={handleChange}
  disabled={isEditMode && !isEditingLoading}
>
            <option value="">Select State</option>
            {states.map(s => (
              <option key={s.state_code} value={s.state_code}>{s.state_name}</option>
            ))}
          </select> </div>
          <div className="form-group">
            <label>Division</label>
          <select name="division_code" value={form.division_code} onChange={handleChange} disabled={(isEditMode && !isEditingLoading) || !divisions.length}>
            <option value="">Select Division</option>
            {divisions.map(d => (
              <option key={d.division_code} value={d.division_code}>{d.division_name}</option>
            ))}
          </select></div>
          <div className="form-group">
            <label>District</label>
          <select name="district_code" value={form.district_code} onChange={handleChange} disabled={(isEditMode && !isEditingLoading) ||!districts.length}>
            <option value="">Select District</option>
            {districts.map(d => (
              <option key={d.district_code} value={d.district_code}>{d.district_name}</option>
            ))}
          </select></div>
          <div className="form-group">
            <label>Taluka</label>
          <select name="taluka_code" value={form.taluka_code} onChange={handleChange} disabled={(isEditMode && !isEditingLoading) ||!talukas.length}>
            <option value="">Select Taluka</option>
            {talukas.map(t => (
              <option key={t.taluka_code} value={t.taluka_code}>{t.taluka_name}</option>
            ))}
          </select></div>
          </div>
          <div className="grid-4">
            <div className="form-group">
            <label>Organization</label>
          <select name="org_id" value={form.org_id} onChange={handleChange} disabled={(isEditMode && !isEditingLoading) ||!organizations.length}>
            <option value="">Select Organization</option>
            {organizations.map(o => (
              <option key={o.organization_id} value={o.organization_id}>{o.organization_name}</option>
            ))}
          </select></div>
          <div className="form-group">
             <label>Department</label>
          <select name="dept_id" value={form.dept_id} onChange={handleChange} disabled={(isEditMode && !isEditingLoading) ||!departments.length}>
            <option value="">Select Department</option>
            {departments.map(d => (
              <option key={d.department_id} value={d.department_id}>{d.department_name}</option>
            ))}
          </select></div>
          <div className="form-group">
            <label>Service</label>
          <select name="service_id" value={form.service_id} onChange={handleChange} disabled={(isEditMode && !isEditingLoading) ||!services.length}>
            <option value="">Select Service</option>
            {services.map(s => (
              <option key={s.service_id} value={s.service_id}>{s.service_name}</option>
            ))}
          </select></div>
          <div className="form-group">
  <label>Officer</label>
  
  <select
    name="officer_id"
    value={form.officer_id}
    onChange={handleChange}
    disabled={(isEditMode && !isEditingLoading)|| officersLoading || !officers.length}
  >
    <option value="">Select Officer</option>
    {officers.map(o => (
      <option key={o.officer_id} value={o.officer_id}>
        {o.full_name}
      </option>
    ))}
  </select>
</div>
        </div>

        <div className="grid-4">
          <div className="form-group"><label>Start Time</label><input type="time" name="start_time" value={form.start_time} onChange={handleChange} /> </div>
          <div className="form-group"><label>End Time</label><input type="time" name="end_time" value={form.end_time} onChange={handleChange} /></div>
          <div className="form-group"><label>Slot Minutes</label><input type="number" name="slot_minutes" value={form.slot_minutes} onChange={handleChange} /> </div>
          <div className="form-group"><label>Buffer Minutes</label><input type="number" name="buffer_minutes" value={form.buffer_minutes} onChange={handleChange} /> </div>
          <div className="form-group"><label>Capacity Per Slot</label><input type="number" name="capacity_per_slot" value={form.capacity_per_slot} onChange={handleChange} /> </div>
          <div className="form-group"><label>Effective From</label><input type="date" name="effective_from" value={form.effective_from} onChange={handleChange} /> </div>
          <div className="form-group"><label>Effective To</label><input type="date" name="effective_to" value={form.effective_to} onChange={handleChange} /> </div>
        </div>
 <div className="form-group">       
<label>Days</label>
        <div className="days">
          
          {DAYS.map(d => (
            <label key={d.value}>
              <input
  type="checkbox"
  checked={form.days_of_week.includes(d.value)}
  disabled={isEditMode}
  onChange={() => toggleDay(d.value)}
/>

              {d.label}
            </label>
          ))}
        </div>
</div>
        <button onClick={generatePreview}>Preview Slots</button>
      </section>

      {previewSlots.length > 0 && (
        <section className="card">
          <h4>Slot Preview</h4>
          <div className="preview">
            {previewSlots.map((s, i) => <span key={i}>{s}</span>)}
          </div>
        </section>
      )}

      <section className="card">
        <h4>Existing Slot Configurations</h4>
        <table>
          <thead>
            <tr>
              <th>Organization</th>
              <th>Department</th>
              <th>Service</th>
              <th>Officer</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Day</th>
              <th>Time</th>
              <th>Capacity</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredConfigs.map(c => (
              <tr key={c.slot_config_id}>
                <td>{c.organization_name}</td>
                <td>{c.department_name || "Any"}</td>
                <td>{c.service_name || "Any"}</td>
                <td>{c.officer_name || "Any"}</td>
                <td>{normalizeDate(c.effective_from)}</td>
                <td>{normalizeDate(c.effective_to)}</td>
                <td>{DAY_LABEL[c.day_of_week]}</td>
                <td>{c.start_time} - {c.end_time}</td>
                <td>{c.max_capacity}</td>
                <td>{c.is_active ? "Active" : "Inactive"}</td>
                <td>
  {c.is_active && (
    <>
      <button onClick={() => handleEdit(c)}>Edit</button>
      <button onClick={() => deactivate(c.slot_config_id)}>Deactivate</button>
    </>
  )}
</td>

              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <button className="save" onClick={save}>
  {isEditMode ? "Update Slot Configuration" : "Save Slot Configuration"}
</button>

    </div>
  );
};

export default SlotConfiguration;