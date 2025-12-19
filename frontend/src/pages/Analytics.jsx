import React, { useState, useEffect } from "react";
import {
  fetchOrganizations,
  fetchDepartmentsByOrg,
  fetchServicesByDept,
  fetchOfficers,
} from "../services/api";
import {getAppointmentsSummary} from '../services/api'

import "../css/analytics.css";
import { FaChartLine } from "react-icons/fa";
import {getActiveDepartment} from "../services/api"
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";

// Sample Data
const fullTrendData = [
  { name: "Mon", value: 10 },
  { name: "Tue", value: 12 },
  { name: "Wed", value: 18 },
  { name: "Thu", value: 15 },
  { name: "Fri", value: 17 },
  { name: "Sat", value: 14 },
  { name: "Sun", value: 20 },
];

const fullDeptData = [
  { name: "Dept A", value: 40 },
  { name: "Dept B", value: 30 },
  { name: "Dept C", value: 30 },
];

const fullWalkinData = [
  { name: "Scheduled", value: 80 },
  { name: "Walk-in", value: 20 },
];

const fullOfficerData = [
  { name: "Officer A", value: 30 },
  { name: "Officer B", value: 50 },
  { name: "Officer C", value: 20 },
];

const COLORS = ["#4e73df", "#1cc88a", "#36b9cc", "#f6c23e", "#e74a3b"];

const Analytics = () => {
  
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [officerFilter, setOfficerFilter] = useState("All");
const [activeDepartmentCount, setActiveDepartmentCount] = useState(0);
const [organizations, setOrganizations] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [services, setServices] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    rescheduled: 0,
    completed: 0
  });
  const [search, setSearch] = useState("");

  // UI state
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [selectedDept, setSelectedDept] = useState(null); // track expanded department
  const [loading, setLoading] = useState(true);

// useEffect(() => {
//   const fetchActiveDepartments = async () => {
//   try {
//     const res = await getActiveDepartment();
//     if (res.data.success) {
//       setActiveDepartmentCount(res.data.data.active_departments);
//     }
//   } catch (err) {
//     console.error("Failed to fetch active departments", err);
//   }
// };


//   fetchActiveDepartments();
// }, []);
 useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // 1️⃣ Organizations
        const { data: orgRes } = await fetchOrganizations();
        const orgRows = Array.isArray(orgRes) ? orgRes : orgRes?.data || [];

        const orgMapped = orgRows.map((o) => ({
          id: o.organization_id ?? o.id,
          name: o.organization_name ?? o.name,
          status: o.is_active ? "Active" : "Inactive",
        }));
        setOrganizations(orgMapped);

        // 2️⃣ Departments for each organization
        let allDepartments = [];
        let allServices = [];

        const deptPromises = orgMapped.map((org) =>
          fetchDepartmentsByOrg(org.id)
        );
        const deptResults = await Promise.all(deptPromises);

        for (let i = 0; i < orgMapped.length; i++) {
          const org = orgMapped[i];
          const deptRes = deptResults[i];
          const deptRows = Array.isArray(deptRes.data)
            ? deptRes.data
            : deptRes.data?.data || [];

          const deptsForOrg = deptRows.map((d) => ({
            id: d.department_id ?? d.id,
            organizationId: org.id,
            name: d.department_name ?? d.name,
            status: d.is_active ? "Active" : "Inactive",
          }));

          allDepartments.push(...deptsForOrg);

          // 3️⃣ Services for each department in this org
          const srvPromises = deptsForOrg.map((dept) =>
            fetchServicesByDept(org.id, dept.id)
          );
          const srvResults = await Promise.all(srvPromises);

          srvResults.forEach((srvRes, idx) => {
            const dept = deptsForOrg[idx];
            const srvRows = Array.isArray(srvRes.data)
              ? srvRes.data
              : srvRes.data?.data || [];

            const svcsForDept = srvRows.map((s) => ({
              id: s.service_id ?? s.id,
              organizationId: org.id,
              departmentId: dept.id,
              name: s.service_name ?? s.name,
              status: s.is_active ? "Active" : "Inactive",
            }));

            allServices.push(...svcsForDept);
          });
        }

        setDepartments(allDepartments);
        setServices(allServices);

        // 4️⃣ Officers (if your backend route exists)
        try {
          const { data: offRes } = await fetchOfficers();
          const offRows = Array.isArray(offRes) ? offRes : offRes?.data || [];
          console.log(offRows,"off")
          const officersMapped = offRows.map((o) => ({
            id: o.officer_id ?? o.id,
            departmentId: o.department_id ?? o.departmentId ?? null,
            name: o.full_name ?? o.name,
            role: o.role ?? o.designation_name ?? "",
            email: o.email ?? o.email_id,
            status: o.is_active ? "Active" : "Inactive",
          }));

          setOfficers(officersMapped);
        } catch (err) {
          console.error("Error loading officers (optional):", err);
          // if API not ready, keep officers empty instead of crashing
        }
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);



  const filteredAppointments = appointments.filter((a) =>
    a.visitor_name?.toLowerCase().includes(search.toLowerCase())
  );
  
  
    useEffect(() => {
    fetchAppointments();
  }, []);
  
  const fetchAppointments = async () => {
    try {
      const res = await getAppointmentsSummary();
      console.log(res,"ress")
      if (res.data.success) {
        const data = res.data.data;
  
        // Stats
        setStats({
          total: data.total,
          pending: data.pending,
          approved: data.approved,
          rejected: data.rejected,
          rescheduled: data.rescheduled,
          completed: data.completed
        });
  
        // Appointment list
        setAppointments(data.appointments || []);
      }
    } catch (error) {
      console.error("Error fetching appointments", error);
    }
  };

  const trendData = fullTrendData;
  const deptData =
    departmentFilter === "All"
      ? fullDeptData
      : fullDeptData.filter((d) => d.name === departmentFilter);

  const walkinData = fullWalkinData;
  const officerData =
    officerFilter === "All"
      ? fullOfficerData
      : fullOfficerData.filter((d) => d.name === officerFilter);


      

  return (
    <div className="analytics-roles-page">
      {/* Header */}
      <div className="header">
        <h1><FaChartLine /> Analytics Dashboard</h1>
      </div>

      <div className="dashboard">
        {/* Filters */}
        <div className="filters">
          <label>
            Department:
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
            >
              <option value="All">All</option>
              <option value="Dept A">Dept A</option>
              <option value="Dept B">Dept B</option>
              <option value="Dept C">Dept C</option>
            </select>
          </label>

          <label>
            Officer:
            <select
              value={officerFilter}
              onChange={(e) => setOfficerFilter(e.target.value)}
            >
              <option value="All">All</option>
              <option value="Officer A">Officer A</option>
              <option value="Officer B">Officer B</option>
              <option value="Officer C">Officer C</option>
            </select>
          </label>
        </div>

        {/* Cards */}
        <div className="cards">
          <div className="card">
            Total Appointments: {stats.total}
          </div>
          <div className="card">
            Walk-ins Today: {walkinData.find((d) => d.name === "Walk-in")?.value || 0}
          </div>
          <div className="card">
  Active Departments: {departments.length}
</div>

          <div className="card">
            Active Officers: {officers.length}
          </div>
        </div>

        {/* Charts */}
        <div className="analytics-page">
        <div className="charts">
          {/* 1. Appointments Trend */}
          <div className="chart">
            <h3>Appointments Trend</h3>
            <div className="chart-content">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#4e73df" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 2. Department-wise Appointments */}
          <div className="chart">
            <h3>Department-wise Appointments</h3>
            <div className="chart-content">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={deptData} dataKey="value" outerRadius={80} label>
                    {deptData.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 3. Walk-ins vs Scheduled */}
          <div className="chart">
            <h3>Walk-ins vs Scheduled</h3>
            <div className="chart-content">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={walkinData} dataKey="value" outerRadius={80} label>
                    {walkinData.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 4. Officer Workload */}
          <div className="chart">
            <h3>Officer Workload</h3>
            <div className="chart-content">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={officerData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#1cc88a" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 5. Slot Utilization / Peak Hours */}
          <div className="chart">
            <h3>Slot Utilization / Peak Hours</h3>
            <div className="chart-content">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#f6c23e" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default Analytics;