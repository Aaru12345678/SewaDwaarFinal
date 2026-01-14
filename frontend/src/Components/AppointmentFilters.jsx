import React, { useState, useEffect, useCallback } from "react";
import "../css/Filters.css";
import { toast } from "react-toastify";
import {
  getStates,
  getDivisions,
  getDistricts,
  getTalukas,
  getOrganizationbyLocation,
  getDepartment,
  getServices,
} from "../services/api";

const AppointmentFilters = ({ onApply }) => {
  // ------------------ Location & Filters ------------------
  const [states, setStates] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [talukas, setTalukas] = useState([]);

  const [organizations, setOrganizations] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [services, setServices] = useState([]);

  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingDivisions, setLoadingDivisions] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingTalukas, setLoadingTalukas] = useState(false);
  const [loadingOrganization, setLoadingOrganization] = useState(false);
  const [loadingDepartment, setLoadingDepartment] = useState(false);
  const [loadingServices, setLoadingServices] = useState(false);

  const [filters, setFilters] = useState({
    state: "",
    division: "",
    district: "",
    taluka: "",
    org_id: "",
    dept_id: "",
    service_id: "",
    dateType: "today",
    fromDate: "",
    toDate: "",
  });

  // ------------------ Fetch States ------------------
  useEffect(() => {
    const fetchStatesData = async () => {
      setLoadingStates(true);
      try {
        const { data } = await getStates();
        setStates(data || []);
      } catch {
        toast.error("Failed to load states");
      } finally {
        setLoadingStates(false);
      }
    };
    fetchStatesData();
  }, []);

  // ------------------ Cascading API Calls ------------------
  const fetchDivisions = useCallback(async (stateCode) => {
    if (!stateCode) return;
    setLoadingDivisions(true);
    try {
      const { data } = await getDivisions(stateCode);
      setDivisions(data || []);
    } catch {
      toast.error("Failed to load divisions");
    } finally {
      setLoadingDivisions(false);
    }
  }, []);

  const fetchDistricts = useCallback(async (stateCode, divisionCode) => {
    if (!stateCode || !divisionCode) return;
    setLoadingDistricts(true);
    try {
      const { data } = await getDistricts(stateCode, divisionCode);
      setDistricts(data || []);
    } catch {
      toast.error("Failed to load districts");
    } finally {
      setLoadingDistricts(false);
    }
  }, []);

  const fetchTalukas = useCallback(async (stateCode, divisionCode, districtCode) => {
    if (!stateCode || !divisionCode || !districtCode) return;
    setLoadingTalukas(true);
    try {
      const { data } = await getTalukas(stateCode, divisionCode, districtCode);
      setTalukas(data || []);
    } catch {
      toast.error("Failed to load talukas");
    } finally {
      setLoadingTalukas(false);
    }
  }, []);

  const fetchDepartments = useCallback(async (orgId) => {
    if (!orgId) return;
    setLoadingDepartment(true);
    try {
      const { data } = await getDepartment(orgId);
      setDepartments(data || []);
    } catch {
      toast.error("Failed to load departments");
    } finally {
      setLoadingDepartment(false);
    }
  }, []);

  const fetchServices = useCallback(async (orgId, deptId) => {
    if (!orgId) return;
    setLoadingServices(true);
    try {
      let data;
      if (deptId) {
        const res = await getServices(orgId, deptId);
        data = res.data;
      }
      setServices(data || []);
    } catch {
      toast.error("Failed to load services");
    } finally {
      setLoadingServices(false);
    }
  }, []);

  // ------------------ Fetch Organizations on Location Change ------------------
  useEffect(() => {
    const fetchOrganizations = async () => {
      if (!filters.state) {
        setOrganizations([]);
        return;
      }
      setLoadingOrganization(true);
      try {
        const payload = {
          state_code: filters.state,
          division_code: filters.division || null,
          district_code: filters.district || null,
          taluka_code: filters.taluka || null,
        };
        const res = await getOrganizationbyLocation(payload);
        setOrganizations(res.data || []);
      } catch {
        toast.error("Failed to load organizations");
      } finally {
        setLoadingOrganization(false);
      }
    };

    fetchOrganizations();
  }, [filters.state, filters.division, filters.district, filters.taluka]);

  // ------------------ Handle Select Changes ------------------
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFilters((prev) => {
      let updated = { ...prev, [name]: value };

      // Cascading resets
      if (name === "state") {
        updated.division = "";
        updated.district = "";
        updated.taluka = "";
        updated.org_id = "";
        updated.dept_id = "";
        updated.service_id = "";
        setDivisions([]);
        setDistricts([]);
        setTalukas([]);
        setDepartments([]);
        setServices([]);
        fetchDivisions(value);
      }

      if (name === "division") {
        updated.district = "";
        updated.taluka = "";
        updated.org_id = "";
        updated.dept_id = "";
        updated.service_id = "";
        setDistricts([]);
        setTalukas([]);
        setDepartments([]);
        setServices([]);
        fetchDistricts(filters.state, value);
      }

      if (name === "district") {
        updated.taluka = "";
        updated.org_id = "";
        updated.dept_id = "";
        updated.service_id = "";
        setTalukas([]);
        setDepartments([]);
        setServices([]);
        fetchTalukas(filters.state, filters.division, value);
      }

      if (name === "taluka") {
        updated.org_id = "";
        updated.dept_id = "";
        updated.service_id = "";
        setDepartments([]);
        setServices([]);
      }

      if (name === "org_id") {
        updated.dept_id = "";
        updated.service_id = "";
        setDepartments([]);
        setServices([]);
        fetchDepartments(value);
        fetchServices(value, null);
      }

      if (name === "dept_id") {
        updated.service_id = "";
        setServices([]);
        fetchServices(filters.org_id, value);
      }

      return updated;
    });
  };

  // ------------------ Automatically Set fromDate/toDate ------------------
  useEffect(() => {
    if (filters.dateType === "custom") return; // keep user-entered dates

    const today = new Date();
    let from = "";
    let to = today.toISOString().split("T")[0];

    switch (filters.dateType) {
      case "today":
        from = to;
        break;
      case "week":
        const weekAgo = new Date();
        weekAgo.setDate(today.getDate() - 6);
        from = weekAgo.toISOString().split("T")[0];
        break;
      case "month":
        const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        from = firstOfMonth.toISOString().split("T")[0];
        break;
      case "year":
        const firstOfYear = new Date(today.getFullYear(), 0, 1);
        from = firstOfYear.toISOString().split("T")[0];
        break;
      default:
        return;
    }

    setFilters((prev) => ({
      ...prev,
      fromDate: from,
      toDate: to,
    }));
  }, [filters.dateType]);

  // ------------------ Apply Filters ------------------
  const applyFilters = () => {
  if (!filters.state || !filters.org_id || !filters.dateType) {
    toast.error("State, Organization, and Date are required");
    return;
  }

  if (filters.fromDate && filters.toDate && filters.fromDate > filters.toDate) {
    toast.error("From Date cannot be later than To Date");
    return;
  }

  const apiFilters = {
    state_code: filters.state || null,
    org_id: filters.org_id || null,
    dept_id: filters.dept_id || null,
    service_id: filters.service_id || null,
    dateType: filters.dateType || "month",
    fromDate: filters.fromDate || null,
    toDate: filters.toDate || null,
  };

  onApply(apiFilters);
};



  // ------------------ Render Options ------------------
  const renderOptions = (list, keyField, labelField) =>
    list.map((i) => (
      <option key={i[keyField]} value={i[keyField]}>
        {i[labelField]}
      </option>
    ));

  return (
    <div className="filters-container">
      {/* ----------- ROW 1 : Location ----------- */}
      <div className="filters-bar row-1">
        <select name="state" value={filters.state} onChange={handleChange}>
          <option value="">
            {loadingStates ? "Loading..." : "Select State"}
          </option>
          {renderOptions(states, "state_code", "state_name")}
        </select>

        <select
          name="division"
          value={filters.division}
          onChange={handleChange}
          disabled={!filters.state}
        >
          <option value="">Select Division</option>
          {renderOptions(divisions, "division_code", "division_name")}
        </select>

        <select
          name="district"
          value={filters.district}
          onChange={handleChange}
          disabled={!filters.division}
        >
          <option value="">Select District</option>
          {renderOptions(districts, "district_code", "district_name")}
        </select>

        <select
          name="taluka"
          value={filters.taluka}
          onChange={handleChange}
          disabled={!filters.district}
        >
          <option value="">Select Taluka</option>
          {renderOptions(talukas, "taluka_code", "taluka_name")}
        </select>
      </div>

      {/* ----------- ROW 2 : Org + Date + Apply ----------- */}
      <div className="filters-bar row-2">
        <select
          name="org_id"
          value={filters.org_id}
          onChange={handleChange}
          disabled={!filters.state}
        >
          <option value="">
            {loadingOrganization ? "Loading..." : "Select Organization"}
          </option>
          {renderOptions(organizations, "organization_id", "organization_name")}
        </select>

        <select
          name="dept_id"
          value={filters.dept_id}
          onChange={handleChange}
          disabled={!filters.org_id}
        >
          <option value="">Select Department</option>
          {renderOptions(departments, "department_id", "department_name")}
        </select>

        <select
          name="service_id"
          value={filters.service_id}
          onChange={handleChange}
          disabled={!filters.org_id}
        >
          <option value="">Select Service</option>
          {renderOptions(services, "service_id", "service_name")}
        </select>

        <select
          name="dateType"
          value={filters.dateType}
          onChange={handleChange}
        >
          <option value="today">Today</option>
          <option value="week">Last 7 Days</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
          <option value="custom">Custom</option>
        </select>

        <button className="apply-btn" onClick={applyFilters}>
          Apply
        </button>
      </div>

      {/* ----------- ROW 3 : Custom Dates ----------- */}
      <div className="custom-date-row">
        <input
          type="date"
          name="fromDate"
          value={filters.fromDate}
          onChange={handleChange}
          disabled={filters.dateType !== "custom"}
        />
        <input
          type="date"
          name="toDate"
          value={filters.toDate}
          onChange={handleChange}
          disabled={filters.dateType !== "custom"}
        />
      </div>
    </div>
  );
};

export default AppointmentFilters;
