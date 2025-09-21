import React from "react";
import "./admin.css";   // 👈 Add this line
import Cards from "../pages/Cards";

 
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const data = [
  { name: "Jan", value: 220 },
  { name: "Feb", value: 230 },
  { name: "Mar", value: 300 },
  { name: "Apr", value: 250 },
  { name: "May", value: 320 },
  { name: "Jun", value: 330 },
  { name: "Jul", value: 410 },
];

const pieData = [
  { name: "Dept A", value: 40 },
  { name: "Dept B", value: 30 },
  { name: "Dept C", value: 30 },
];

const COLORS = ["#0088FE", "#00C49F", "#FF8042"];

const Admin = () => {
  return (
    <div className="dashboard">
      {/* Cards Section */}
      <div className="cards">
        <Cards number="32" label="Appointments Today" />
        <Cards number="8" label="Walk-ins Today" />
        <Cards number="12" label="Active Departments" />
        <Cards number="5" label="Active Officers" />
      </div>

      {/* Charts Section */}
      <div className="charts">
        {/* Line Chart */}
        <div className="chart">
          <h3>Appointments</h3>
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#007bff"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="chart">
          <h3>Department-wise Appointments</h3>
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  outerRadius={100}
                  fill="#8884d8"
                  label
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
