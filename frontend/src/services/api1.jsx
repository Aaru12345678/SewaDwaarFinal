// src/services/api.jsx
import axios from "axios";

const BASE_URL = "http://localhost:5000/api";

const api = axios.create({
  baseURL: BASE_URL,
});

// ✅ Protected endpoints as method+path combos (no public routes here)
const protectedEndpoints = [
  // signupController.js
  { method: "GET",  path: "/pending-signups" },
  { method: "POST", path: "/approve/:id" },
  { method: "POST", path: "/change-password" },

  // schemeController.js
  { method: "POST", path: "/scheme" },
  { method: "POST", path: "/scheme/data" },
  { method: "GET",  path: "/scheme/:schemeCode/categories" },
  { method: "GET",  path: "/scheme/:schemeCode" },
  { method: "POST", path: "/scheme/:id/approve" },
  { method: "POST", path: "/scheme/:id/reject" },
  { method: "GET",  path: "/scheme/:schemeCode/data" },
  { method: "PUT",  path: "/scheme/:schemeCode/data/:id" },
    { method: "POST", path: "/superuser/update-info" },


 
];

// ✅ Utility to check if an endpoint is protected (supports :params)
const matchesProtectedEndpoint = (method, url) => {
  return protectedEndpoints.some(endpoint => {
    if (endpoint.method !== method.toUpperCase()) return false;
    const pattern = new RegExp(
      "^" +
        endpoint.path
          .replace(/:[^/]+/g, "[^/]+") // replace :param with wildcard
          .replace(/\//g, "\\/") +
        "$"
    );
    return pattern.test(url);
  });
};

// ✅ Axios interceptor to attach token only when needed
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  const urlPath = config.url.split("?")[0]; // remove query params

  if (token && matchesProtectedEndpoint(config.method, urlPath)) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const safeRequest = async (request) => {
  try {
    const response = await request;
    return { data: response.data, error: null };
  } catch (error) {
    console.error("API error:", error?.response?.data || error.message || error);
    return { data: null, error };
  }
};

// ================= AUTH =================
export const loginUser = (credentials) =>
  safeRequest(api.post("/login", credentials));

export const submitSignup = (payload) =>
  safeRequest(api.post("/signup", payload));

export const changePassword = (payload) =>
  safeRequest(api.post("/change-password", payload));

export const updateSuperUserInfo = (payload) =>
  safeRequest(api.post("/superuser/update-info", payload));

export const fetchPendingUsers = ({ page, limit, role_code, state_code, division_code }) =>
  safeRequest(api.get("/pending-signups", {
    params: { page, limit, role_code, state_code, division_code },
  }));

// ================= LOCATION DATA =================
export const getStates = () => safeRequest(api.get("/states"));
export const getMinistry = () => safeRequest(api.get("/ministry"));
export const getDivisions = (stateCode) =>
  safeRequest(api.get(`/divisions/${stateCode}`));
export const getDepartments = (stateCode) =>
  safeRequest(api.get(`/departments/${stateCode}`));
export const getDistricts = (stateCode, divisionCode) =>
  safeRequest(api.get(`/districts`, {
    params: { state_code: stateCode, division_code: divisionCode },
  }));
export const getTalukas = (stateCode, divisionCode, districtCode) =>
  safeRequest(api.get(`/talukas`, {
    params: { state_code: stateCode, division_code: divisionCode, district_code: districtCode },
  }));

// ================= SCHEMES =================
export const fetchSchemes = () => safeRequest(api.get("/scheme/list")); // Public
export const fetchSchemes2 = () => safeRequest(api.get("/scheme/list2")); // Public
export const fetchSchemeStructure = (schemeCode) =>
  safeRequest(api.get(`/scheme/${schemeCode}/categories`));
export const uploadSchemeData = (payload) =>
  safeRequest(api.post("/scheme/data", payload));
export const createScheme = (payload) =>
  safeRequest(api.post("/scheme", payload));
export const fetchApprovalData = (schemeCode) =>
  safeRequest(api.get(`/scheme/${schemeCode}`));
export const approveSignup = (id, payload) =>
  safeRequest(api.post(`/approve/${id}`, payload));
export const approveData = (id) =>
  safeRequest(api.post(`/scheme/${id}/approve`));
export const rejectData = (id, remark) =>
  safeRequest(api.post(`/scheme/${id}/reject`, { remark }));
export const fetchSchemeData = (
  schemeCode,
  stateCode = null,
  divisionCode = null,
  districtCode = null,
  talukaCode = null,
  year = null,
  month = null
) =>
  safeRequest(
    api.get(`/scheme/${schemeCode}/data`, {
      params: {
        stateCode,
        divisionCode,
        districtCode,
        talukaCode,
        year,
        month,
      },
    })
  );
export const updateSchemeData = (schemeCode, id, data) =>
  safeRequest(api.put(`/scheme/${schemeCode}/data/${id}`, data));

// ================= DASHBOARD =================
export const getDashboardData = (filters) =>
  safeRequest(api.post("/getDashboardData", { params: filters }));

export const getTimeSeriesData = (payload) =>
  safeRequest(api.post("/dashboard/timeseries", { params: payload }));
