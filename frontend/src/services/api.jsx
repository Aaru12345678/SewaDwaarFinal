import axios from "axios";
// import { getRolesSummary } from "../../../backend/controllers/appointmentController";

const BASE_URL = "http://localhost:5000/api"; // backend URL

const api = axios.create({
  baseURL: BASE_URL,
});

// Centralized safe request
const safeRequest = async (request) => {
  try {
    const response = await request;
    return { data: response.data, error: null };
  } catch (error) {
    console.error("API error:", error?.response?.data || error.message || error);
    return { data: null, error };
  }
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  console.log(token)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ================= LOCATION DATA =================
export const getStates = () => safeRequest(api.get("/states"));
export const getDivisions = (stateCode) => safeRequest(api.get(`/divisions/${stateCode}`));
export const getDistricts = (stateCode, divisionCode) =>
  safeRequest(api.get("/districts", { params: { state_code: stateCode, division_code: divisionCode } }));
export const getTalukas = (stateCode, divisionCode, districtCode) =>
  safeRequest(api.get("/talukas", { params: { state_code: stateCode, division_code: divisionCode, district_code: districtCode } }));
export const getDesignations = () => safeRequest(api.get("/designations"));
export const getOrganization = () => safeRequest(api.get("/organization"));
export const getOrganizationById = (organization_id) => safeRequest(api.get(`/organization/${organization_id}`));
export const getOrganizationbyLocation = (params) =>
  safeRequest(
    api.get("/organizationbylocation", { params })
  );
export const getDepartment = (organization_id) => safeRequest(api.get(`/department/${organization_id}`));
export const getServices = (organization_id, department_id) =>
  safeRequest(api.get(`/services/${organization_id}/${department_id}`));
export const getServices2 = (organization_id) =>
  safeRequest(api.get(`/services/${organization_id}`));


// ================= AUTH & SIGNUP =================
export const submitSignup = (payload) => safeRequest(api.post("/signup", payload));
// walkin registration for new user:
export const submitWalkinSignup = (payload) => safeRequest(api.post("/walkinsignup", payload));

export const login = (payload) => safeRequest(api.post("/login", payload));
export const registerUserByRole = (payload) => safeRequest(api.post("/users_signup", payload)); // ✅ Main officer registration
export const userLogin = (payload) => safeRequest(api.post("/users_login", payload));
export const adminLoginAPI = (payload) => safeRequest(api.post("/admins_login", payload));
export const changePassword=(payload)=>safeRequest(api.post("/change-password",payload));
// in api.jsx
export const officerLogin = (payload) => safeRequest(api.post("/users_login", payload));

// Optional endpoint if needed separately
export const registerOfficer = (payload) => safeRequest(api.post("/register-officer", payload));

// ================= LOCATION / ROLES =================
export const getRoles = () => safeRequest(api.get("/roles"));

// ================= APPOINTMENTS =================
export const submitAppointment = (payload) => safeRequest(api.post("/appointments", payload));

export const getAppointmentsSummary = (params) =>
  safeRequest(api.get("/appointments/summary", { params }));

export const submitWalkinAppointment=(payload)=>safeRequest(api.post("/walkin_appointments",payload))
// =============================
// DELETE APPOINTMENT (ADMIN)
// =============================
export const deleteAppointment = (appointmentId) =>
  safeRequest(
    api.delete(`/appointments/${appointmentId}`)
  );

export const getRolesSummary=()=>safeRequest(api.get("/appointments/usersummary"));
// ================= VISITOR DASHBOARD =================
export const getVisitorDashboard = (username) =>
  safeRequest(api.get(`/visitor/${username}/dashboard`));

export const getVisitorProfile = (username) =>
  safeRequest(api.get(`/visitor/profile/${username}`));

export const updateVisitorProfile = (username,payload) =>
  safeRequest(api.put(`/visitor/profile/${username}`,payload,{ headers: { "Content-Type": "multipart/form-data" } }));

// export const changePassword = (username) =>
//   safeRequest(api.put(`/visitor/change-password/${username}`));

export const getUnreadNotificationCount = (username) =>
  safeRequest(
    api.get(`/visitor/notifications/unreadcount`, {
      params: { username },
    })
  );
export const markNotificationsAsRead = () =>
  safeRequest(api.put("/visitor/notifications/mark-read"));



// ============ BOOK APPOINTMENT ==============
export const uploadAppointmentDocuments = (appointmentId, files, uploaded_by, doc_type) => {
  const formData = new FormData();
  files.forEach((file) => formData.append("documents", file)); // append multiple files
  if (uploaded_by) formData.append("uploaded_by", uploaded_by);
  if (doc_type) formData.append("doc_type", doc_type);

  return safeRequest(api.post(`/appointments/${appointmentId}/documents`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  }));
};

export const getOfficersByLocation = (payload) => 
  safeRequest(api.post("/getOfficersByLocation", payload));

export const getServicesById = (services_id) =>
  safeRequest(api.get(`/getServices/${services_id}`));



export const insertServices = (data) =>
  safeRequest(api.post("/services/insert-multiple", data));

export const insertDepartments = (payload) =>
  safeRequest(api.post("/department/bulk", payload));

export const getActiveDepartment = () =>
  safeRequest(api.get("/department/activedepartments"));

// export const getDepartmentById = (department_id) =>
//   safeRequest(api.get(`/department/${department_id}`));


export const cancelAppointment = (id, reason) =>
  safeRequest(api.put(`/appointments/cancel/${id}`, { cancelled_reason: reason }));

// =============================
// ADMIN DASHBOARD (FETCH)
// =============================
export const fetchOrganizations = () =>
  safeRequest(api.get("/organizations"));



export const fetchDepartmentsByOrg = (orgId) =>
  safeRequest(api.get(`/organizations/${orgId}/departments`));

export const fetchServicesByDept = (orgId, deptId) =>
  safeRequest(api.get(`/fetch/services/${orgId}/${deptId}`));

export const getDepartmentById = (department_id) =>
  safeRequest(api.get(`/departments/${department_id}`));

export const fetchOfficers = () =>
  safeRequest(api.get("/officers"));

export const UpdateaddBulkDepartments = (payload) =>
  safeRequest(
    api.put("/update-departments", payload) // ✅ payload passed correctly
  );

  export const updateMultipleServices = (payload) =>
  safeRequest(
    api.put("/update-services", payload) // ✅ payload passed correctly
  );



// ================= OFFICER DASHBOARD =================
export const getOfficerDashboard = (officerId) =>
  safeRequest(api.get(`/officer/${officerId}/dashboard`));

// ===========Analytics(Online)=======================

// ---------------- KPI ----------------
export const fetchApplicationAppointmentKpis = async (filters) => {
  const res = await axios.get(
    `${BASE_URL}/appointment-analytics/application/kpis`,
    { params: filters }
  );
  return res.data;
};

// ---------------- TREND ----------------
export const fetchApplicationAppointmentsTrend = async (filters) => {
  const res = await axios.get(
    `${BASE_URL}/appointment-analytics/application/trend`,
    { params: filters }
  );
  return res.data;
};

// ---------------- DEPARTMENT ----------------
export const fetchAppointmentsByDepartment = async (filters) => {
  const cleanFilters = { ...filters };
  delete cleanFilters.service_id;

  const res = await axios.get(
    `${BASE_URL}/appointment-analytics/application/by-department`,
    { params: cleanFilters }
  );
  console.log("API Dept Response:", res.data);
  return res.data;
};


// ---------------- SERVICE ----------------
export const fetchAppointmentsByService = async (filters) => {
  const res = await axios.get(
    `${BASE_URL}/appointment-analytics/application/by-service`,
    { params: filters }
  );
  return res.data;
};

// ---------------- WALK-IN KPIs ----------------
// ---------------- WALK-IN KPIs ----------------
export const fetchWalkinKpis = async (filters) => {
  const res = await axios.get(
    `${BASE_URL}/walkin-analytics/kpis`,
    { params: filters  || {} }
  );
  return res.data;
};

/* ---------------- TREND ---------------- */
export const fetchWalkinsTrend = async (filters = {}) => {
  const res = await axios.get(
    `${BASE_URL}/walkin-analytics/trend`,
    { params: filters }
  );
  return res.data;
};

/* ---------------- DEPARTMENT ---------------- */
export const fetchWalkinsByDepartment = async (filters = {}) => {
  const cleanFilters = { ...filters };

  // ❌ department chart should NOT filter by service
  delete cleanFilters.service_id;

  const res = await axios.get(
    `${BASE_URL}/walkin-analytics/by-department`,
    { params: cleanFilters }
  );

  console.log("Walk-in Dept Response:", res.data);
  return res.data;
};

/* ---------------- SERVICE ---------------- */
export const fetchWalkinsByService = async (filters = {}) => {
  const res = await axios.get(
    `${BASE_URL}/walkin-analytics/by-service`,
    { params: filters }
  );
  return res.data;
};
// get users info by mobile no:
export const getUserByMobileno=(mobileno)=>safeRequest(api.get(`/helpdesk/users/mobile/${mobileno}`))

export const getVisitorDetails = (params) =>
  safeRequest(
    api.get("/helpdesk/visitor", {
      params
    })
  );

  export const getHelpdeskDashboardCounts = (helpdesk_id) =>
  safeRequest(
    api.get(`/helpdesk/helpdeskdashboard/${helpdesk_id}`)
  );


  /* =====================================================
   SLOT CONFIG – ADMIN
===================================================== */

/* 🔹 Get all slot configurations (table) */
export const getSlotConfigs = () =>
  safeRequest(api.get("/slot-config/configs"));

/* 🔹 Preview generated slots before save */
export const previewSlots = (payload) =>
  safeRequest(api.post("/slot-config/preview", payload));

/* 🔹 Create slot configuration */
export const createSlotConfig = (payload) =>
  safeRequest(api.post("/slot-config/create", payload));

/* 🔹 Update slot configuration */
export const updateSlotConfig = (payload) =>
  safeRequest(api.put("/slot-config/update", payload));

/* 🔹 Deactivate slot configuration */
export const deactivateSlotConfig = (slot_config_id) =>
  safeRequest(api.delete(`/slot-config/deactivate/${slot_config_id}`));

/* =====================================================
   SLOT AVAILABILITY – BOOKING / WALK-IN
===================================================== */

/* 🔹 Get available slots (appointments + walk-ins) */
export const getAvailableSlots = (params) =>
  safeRequest(
    api.get("/slot-config/available-slots", { params })
  );

  
export const sendForgotOtp = (payload) =>
  axios.post(`${BASE_URL}/auth/forgot-password/send-otp`, payload);

export const resetPassword = (payload) =>
  axios.post(`${BASE_URL}/auth/forgot-password/reset`, payload);

// 🔄 Update departments & services
export const getUserByEntityId =(entity_id)=>safeRequest(
    api.get(`/user/entity/${entity_id}`)
  );


export const updateOfficerByRole =(payload)=>safeRequest(
    api.put("/update-officer",payload)
  );

  // Get all holidays
export const getSlotHolidays = () => safeRequest(api.get("/slot-holidays"));

// Create new holiday
export const createSlotHoliday = (payload) => safeRequest(api.post("/slot-holidays", payload));

// Deactivate holiday
export const deactivateSlotHoliday = (holiday_id) =>
  safeRequest(api.delete(`/slot-holidays/${holiday_id}`));

export const updateSlotHoliday = (holiday_id, payload) =>
  safeRequest(api.put(`/slot-holidays/${holiday_id}`, payload));

export const getSlotHolidayById = (holiday_id) =>
  safeRequest(api.get(`/slot-holidays/${holiday_id}`));