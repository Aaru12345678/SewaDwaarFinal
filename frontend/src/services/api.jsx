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

// ================= LOCATION DATA =================
export const getStates = () => safeRequest(api.get("/states"));
export const getDivisions = (stateCode) => safeRequest(api.get(`/divisions/${stateCode}`));
export const getDistricts = (stateCode, divisionCode) =>
  safeRequest(api.get("/districts", { params: { state_code: stateCode, division_code: divisionCode } }));
export const getTalukas = (stateCode, divisionCode, districtCode) =>
  safeRequest(api.get("/talukas", { params: { state_code: stateCode, division_code: divisionCode, district_code: districtCode } }));
export const getDesignations = () => safeRequest(api.get("/designations"));
export const getOrganization = () => safeRequest(api.get("/organization"));
export const getDepartment = (organization_id) => safeRequest(api.get(`/department/${organization_id}`));
export const getServices = (organization_id, department_id) =>
  safeRequest(api.get(`/services/${organization_id}/${department_id}`));
export const getServices2 = (organization_id) =>
  safeRequest(api.get(`/services/${organization_id}`));


// ================= AUTH & SIGNUP =================
export const submitSignup = (payload) => safeRequest(api.post("/signup", payload));
export const login = (payload) => safeRequest(api.post("/login", payload));
export const registerUserByRole = (payload) => safeRequest(api.post("/users_signup", payload)); // ✅ Main officer registration
export const userLogin = (payload) => safeRequest(api.post("/users_login", payload));
export const adminLoginAPI = (payload) => safeRequest(api.post("/admins_login", payload));
// in api.jsx
export const officerLogin = (payload) => safeRequest(api.post("/users_login", payload));

// Optional endpoint if needed separately
export const registerOfficer = (payload) => safeRequest(api.post("/register-officer", payload));

// ================= LOCATION / ROLES =================
export const getRoles = () => safeRequest(api.get("/roles"));

// ================= APPOINTMENTS =================
export const submitAppointment = (payload) => safeRequest(api.post("/appointments", payload));

export const getAppointmentsSummary=()=>safeRequest(api.get("/appointments/summary"));

export const getRolesSummary=()=>safeRequest(api.get("/appointments/usersummary"));
// ================= VISITOR DASHBOARD =================
export const getVisitorDashboard = (username) =>
  safeRequest(api.get(`/visitor/${username}/dashboard`));

export const getVisitorProfile = (username) =>
  safeRequest(api.get(`/visitor/profile/${username}`));

export const updateVisitorProfile = (username,payload) =>
  safeRequest(api.put(`/visitor/profile/${username}`,payload,{ headers: { "Content-Type": "multipart/form-data" } }));

export const changePassword = (username) =>
  safeRequest(api.put(`/visitor/change-password/${username}`));


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


export const insertServices = (data) =>
  safeRequest(api.post("/services/insert-multiple", data));

export const insertDepartments = (payload) =>
  safeRequest(api.post("/department/bulk", payload));

export const getActiveDepartment = () =>
  safeRequest(api.get("/department/activedepartments"));

// Cancel Appointment
export const cancelAppointment = (id) =>
  safeRequest(api.put(`/appointments/cancel/${id}`));

// =============================
// ADMIN DASHBOARD (FETCH)
// =============================
export const fetchOrganizations = () =>
  safeRequest(api.get("/organization"));

export const fetchDepartmentsByOrg = (orgId) =>
  safeRequest(api.get(`/departments/${orgId}`));

export const fetchServicesByDept = (orgId, deptId) =>
  safeRequest(api.get(`/services/${orgId}/${deptId}`));

export const fetchOfficers = () =>
  safeRequest(api.get("/officers"));