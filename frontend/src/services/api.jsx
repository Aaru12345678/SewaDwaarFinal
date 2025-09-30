import axios from "axios";

const BASE_URL = "http://localhost:5000/api";

const api = axios.create({
  baseURL: BASE_URL,
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

// ================= LOCATION DATA =================
export const getStates = () => safeRequest(api.get("/states"));
export const getDivisions = (stateCode) =>
  safeRequest(api.get(`/divisions/${stateCode}`));
export const getDistricts = (stateCode, divisionCode) =>
  safeRequest(api.get(`/districts`, {
    params: { state_code: stateCode, division_code: divisionCode },
  }));
export const getTalukas = (stateCode, divisionCode, districtCode) =>
  safeRequest(api.get(`/talukas`, {
    params: { state_code: stateCode, division_code: divisionCode, district_code: districtCode },
  }));

  // ==================================================

export const submitSignup = (payload) =>
  safeRequest(api.post("/signup", payload));

export const login = (payload) =>
  safeRequest(api.post("/", payload));