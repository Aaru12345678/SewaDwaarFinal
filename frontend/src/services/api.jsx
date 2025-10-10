import axios from "axios";

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

// ================= AUTH & SIGNUP =================
export const submitSignup = (payload) => safeRequest(api.post("/signup", payload));
export const login = (payload) => safeRequest(api.post("/login", payload));
export const registerOfficer = (payload) => safeRequest(api.post("/officers_signup", payload));
export const Officerlogin = (payload) => safeRequest(api.post("/officers_login", payload));

// ================= APPOINTMENTS =================
export const submitAppointment = (payload) => safeRequest(api.post("/appointments", payload));

// ================= VISITOR DASHBOARD =================
export const getVisitorDashboard = (username) =>
  safeRequest(api.get(`/visitor/${username}/dashboard`));