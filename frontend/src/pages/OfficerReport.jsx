import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from "recharts";
import {
  FaArrowLeft,
  FaUser,
  FaSignOutAlt,
  FaCalendarAlt,
  FaChartBar,
  FaChartPie,
  FaChartLine,
  FaDownload,
  FaCalendarWeek,
  FaCalendarCheck,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaRedo,
  FaUsers,
  FaTrophy,
  FaPercentage
} from "react-icons/fa";
import "../css/Dashboard.css";
import NavbarTop from '../Components/NavbarTop';
import Header from '../Components/Header';
import OfficerNavbar from "./OfficerNavbar";


const COLORS = ['#10b981', '#ef4444', '#f59e0b', '#6366f1', '#8b5cf6', '#3b82f6'];
const STATUS_COLORS = {
  completed: '#10b981',
  rejected: '#ef4444',
  pending: '#f59e0b',
  approved: '#3b82f6',
  rescheduled: '#8b5cf6'
};

const OfficerReports = () => {
  const navigate = useNavigate();
  const reportRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [fullName, setFullName] = useState("Officer");
  const [reportType, setReportType] = useState("monthly"); // monthly, weekly, custom
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reportData, setReportData] = useState(null);

  const officerId = localStorage.getItem("username");

  useEffect(() => {
    if (!officerId) {
      navigate("/login/officerlogin");
      return;
    }
    fetchReportData();
  }, [officerId, navigate, reportType, selectedMonth]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      let url = `http://localhost:5000/api/officer/${officerId}/reports?type=${reportType}`;
      
      if (reportType === "monthly") {
        url += `&month=${selectedMonth}`;
      } else if (reportType === "weekly") {
        const today = new Date();
        const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
        url += `&start=${weekStart.toISOString().split('T')[0]}&end=${new Date().toISOString().split('T')[0]}`;
      } else if (reportType === "custom" && startDate && endDate) {
        url += `&start=${startDate}&end=${endDate}`;
      }

      const response = await fetch(url);
      const result = await response.json();

      if (result.success) {
        setReportData(result.data);
        setFullName(result.data.officer_name || "Officer");
      } else {
        toast.error(result.message || "Failed to fetch report data");
      }
    } catch (err) {
      console.error("Error fetching report:", err);
      // Generate sample data for demo
      generateSampleData();
    }
    setLoading(false);
  };

  const generateSampleData = () => {
    const days = reportType === "weekly" ? 7 : 30;
    const dailyData = [];
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      dailyData.push({
        date: date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
        fullDate: date.toISOString().split('T')[0],
        completed: Math.floor(Math.random() * 8) + 2,
        approved: Math.floor(Math.random() * 5) + 1,
        rejected: Math.floor(Math.random() * 3),
        rescheduled: Math.floor(Math.random() * 2),
        pending: Math.floor(Math.random() * 4) + 1,
      });
    }

    const totals = dailyData.reduce((acc, day) => ({
      completed: acc.completed + day.completed,
      approved: acc.approved + day.approved,
      rejected: acc.rejected + day.rejected,
      rescheduled: acc.rescheduled + day.rescheduled,
      pending: acc.pending + day.pending,
    }), { completed: 0, approved: 0, rejected: 0, rescheduled: 0, pending: 0 });

    const total = totals.completed + totals.approved + totals.rejected + totals.rescheduled + totals.pending;

    setReportData({
      officer_name: fullName,
      period: reportType === "weekly" ? "This Week" : selectedMonth,
      summary: {
        total_appointments: total,
        completed: totals.completed,
        approved: totals.approved,
        rejected: totals.rejected,
        rescheduled: totals.rescheduled,
        pending: totals.pending,
        completion_rate: ((totals.completed / total) * 100).toFixed(1),
        approval_rate: (((totals.completed + totals.approved) / total) * 100).toFixed(1),
        avg_daily: (total / days).toFixed(1),
        peak_day: dailyData.reduce((max, day) => {
          const dayTotal = day.completed + day.approved + day.rejected + day.rescheduled + day.pending;
          return dayTotal > max.total ? { date: day.date, total: dayTotal } : max;
        }, { date: '', total: 0 }),
      },
      daily_breakdown: dailyData,
      status_distribution: [
        { name: 'Completed', value: totals.completed, color: STATUS_COLORS.completed },
        { name: 'Approved', value: totals.approved, color: STATUS_COLORS.approved },
        { name: 'Pending', value: totals.pending, color: STATUS_COLORS.pending },
        { name: 'Rejected', value: totals.rejected, color: STATUS_COLORS.rejected },
        { name: 'Rescheduled', value: totals.rescheduled, color: STATUS_COLORS.rescheduled },
      ],
      hourly_distribution: [
        { hour: '9 AM', appointments: Math.floor(Math.random() * 15) + 5 },
        { hour: '10 AM', appointments: Math.floor(Math.random() * 20) + 10 },
        { hour: '11 AM', appointments: Math.floor(Math.random() * 25) + 15 },
        { hour: '12 PM', appointments: Math.floor(Math.random() * 15) + 8 },
        { hour: '2 PM', appointments: Math.floor(Math.random() * 20) + 12 },
        { hour: '3 PM', appointments: Math.floor(Math.random() * 18) + 10 },
        { hour: '4 PM', appointments: Math.floor(Math.random() * 12) + 5 },
        { hour: '5 PM', appointments: Math.floor(Math.random() * 8) + 3 },
      ],
    });
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const handleCustomDateSearch = () => {
    if (!startDate || !endDate) {
      toast.error("Please select both start and end dates");
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      toast.error("Start date cannot be after end date");
      return;
    }
    fetchReportData();
  };

  const downloadPDF = () => {
    if (!reportData) {
      toast.warning("No report data to download");
      return;
    }

    const periodLabel = reportType === "monthly" 
      ? new Date(selectedMonth + "-01").toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
      : reportType === "weekly" 
        ? "This Week"
        : `${startDate} to ${endDate}`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Officer Report - ${periodLabel}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            padding: 40px; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
          }
          .report-container {
            background: white;
            border-radius: 20px;
            padding: 40px;
            max-width: 900px;
            margin: 0 auto;
            box-shadow: 0 25px 50px rgba(0,0,0,0.2);
          }
          .header {
            text-align: center;
            margin-bottom: 40px;
            padding-bottom: 30px;
            border-bottom: 3px solid #667eea;
          }
          .header h1 {
            color: #1a1a2e;
            font-size: 32px;
            margin-bottom: 10px;
          }
          .header .subtitle {
            color: #667eea;
            font-size: 18px;
            font-weight: 600;
          }
          .header .period {
            color: #666;
            font-size: 14px;
            margin-top: 8px;
          }
          .officer-info {
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            padding: 20px 30px;
            border-radius: 15px;
            margin-bottom: 30px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .officer-info h3 {
            font-size: 20px;
          }
          .officer-info .date {
            font-size: 14px;
            opacity: 0.9;
          }
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            margin-bottom: 40px;
          }
          .stat-card {
            background: linear-gradient(135deg, #f8f9ff, #f0f4ff);
            padding: 25px;
            border-radius: 15px;
            text-align: center;
            border: 1px solid #e0e7ff;
          }
          .stat-card.highlight {
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            border: none;
          }
          .stat-card .number {
            font-size: 36px;
            font-weight: 700;
            color: #1a1a2e;
            display: block;
          }
          .stat-card.highlight .number {
            color: white;
          }
          .stat-card .label {
            font-size: 14px;
            color: #666;
            margin-top: 5px;
          }
          .stat-card.highlight .label {
            color: rgba(255,255,255,0.9);
          }
          .section {
            margin-bottom: 35px;
          }
          .section-title {
            font-size: 20px;
            color: #1a1a2e;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #f0f4ff;
            display: flex;
            align-items: center;
            gap: 10px;
          }
          .status-breakdown {
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 15px;
          }
          .status-item {
            text-align: center;
            padding: 20px 15px;
            border-radius: 12px;
            color: white;
          }
          .status-item.completed { background: linear-gradient(135deg, #10b981, #059669); }
          .status-item.approved { background: linear-gradient(135deg, #3b82f6, #2563eb); }
          .status-item.pending { background: linear-gradient(135deg, #f59e0b, #d97706); }
          .status-item.rejected { background: linear-gradient(135deg, #ef4444, #dc2626); }
          .status-item.rescheduled { background: linear-gradient(135deg, #8b5cf6, #7c3aed); }
          .status-item .count {
            font-size: 28px;
            font-weight: 700;
            display: block;
          }
          .status-item .name {
            font-size: 12px;
            opacity: 0.9;
            margin-top: 5px;
          }
          .insights {
            background: #fffbeb;
            border: 1px solid #fcd34d;
            border-radius: 15px;
            padding: 25px;
          }
          .insights h4 {
            color: #92400e;
            margin-bottom: 15px;
            font-size: 16px;
          }
          .insights ul {
            list-style: none;
          }
          .insights li {
            padding: 8px 0;
            color: #78350f;
            font-size: 14px;
            border-bottom: 1px solid #fef3c7;
          }
          .insights li:last-child {
            border-bottom: none;
          }
          .insights li strong {
            color: #92400e;
          }
          .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #f0f4ff;
            color: #666;
            font-size: 12px;
          }
          .performance-bar {
            background: #e5e7eb;
            border-radius: 10px;
            height: 20px;
            overflow: hidden;
            margin: 10px 0;
          }
          .performance-fill {
            height: 100%;
            border-radius: 10px;
            background: linear-gradient(90deg, #10b981, #3b82f6);
          }
          @media print {
            body { background: white; padding: 0; }
            .report-container { box-shadow: none; }
          }
        </style>
      </head>
      <body>
        <div class="report-container">
          <div class="header">
            <h1>🏛️ SewaDwaar</h1>
            <div class="subtitle">Officer Performance Report</div>
            <div class="period">${periodLabel}</div>
          </div>

          <div class="officer-info">
            <div>
              <h3>👤 ${reportData.officer_name}</h3>
              <div>Officer ID: ${officerId}</div>
            </div>
            <div class="date">
              Generated: ${new Date().toLocaleString('en-IN')}
            </div>
          </div>

          <div class="stats-grid">
            <div class="stat-card highlight">
              <span class="number">${reportData.summary.total_appointments}</span>
              <span class="label">Total Appointments</span>
            </div>
            <div class="stat-card">
              <span class="number">${reportData.summary.completion_rate}%</span>
              <span class="label">Completion Rate</span>
            </div>
            <div class="stat-card">
              <span class="number">${reportData.summary.avg_daily}</span>
              <span class="label">Avg. Daily</span>
            </div>
          </div>

          <div class="section">
            <h3 class="section-title">📊 Status Breakdown</h3>
            <div class="status-breakdown">
              <div class="status-item completed">
                <span class="count">${reportData.summary.completed}</span>
                <span class="name">Completed</span>
              </div>
              <div class="status-item approved">
                <span class="count">${reportData.summary.approved}</span>
                <span class="name">Approved</span>
              </div>
              <div class="status-item pending">
                <span class="count">${reportData.summary.pending}</span>
                <span class="name">Pending</span>
              </div>
              <div class="status-item rejected">
                <span class="count">${reportData.summary.rejected}</span>
                <span class="name">Rejected</span>
              </div>
              <div class="status-item rescheduled">
                <span class="count">${reportData.summary.rescheduled}</span>
                <span class="name">Rescheduled</span>
              </div>
            </div>
          </div>

          <div class="section">
            <h3 class="section-title">📈 Performance Metrics</h3>
            <div style="margin-bottom: 20px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                <span>Completion Rate</span>
                <strong>${reportData.summary.completion_rate}%</strong>
              </div>
              <div class="performance-bar">
                <div class="performance-fill" style="width: ${reportData.summary.completion_rate}%"></div>
              </div>
            </div>
            <div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                <span>Approval Rate</span>
                <strong>${reportData.summary.approval_rate}%</strong>
              </div>
              <div class="performance-bar">
                <div class="performance-fill" style="width: ${reportData.summary.approval_rate}%"></div>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="insights">
              <h4>💡 Key Insights</h4>
              <ul>
                <li>📅 <strong>Peak Day:</strong> ${reportData.summary.peak_day?.date || 'N/A'} with ${reportData.summary.peak_day?.total || 0} appointments</li>
                <li>✅ <strong>Completion Rate:</strong> ${reportData.summary.completion_rate}% of all appointments were successfully completed</li>
                <li>📊 <strong>Daily Average:</strong> Handling approximately ${reportData.summary.avg_daily} appointments per day</li>
                <li>🔄 <strong>Rescheduled:</strong> ${((reportData.summary.rescheduled / reportData.summary.total_appointments) * 100).toFixed(1)}% appointments were rescheduled</li>
                <li>❌ <strong>Rejection Rate:</strong> ${((reportData.summary.rejected / reportData.summary.total_appointments) * 100).toFixed(1)}% appointments were rejected</li>
                <li>⏳ <strong>Pending:</strong> ${reportData.summary.pending} appointments still pending action</li>
              </ul>
            </div>
          </div>

          <div class="footer">
            <p>This report was automatically generated by SewaDwaar Appointment Management System</p>
            <p style="margin-top: 5px;">© ${new Date().getFullYear()} SewaDwaar. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    setTimeout(() => {
      printWindow.print();
    }, 500);
    
    toast.success("Report opened for printing/download");
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loader-spinner"></div>
        <p>Loading report data...</p>
      </div>
    );
  }

  return (
    <>    
    <div className="fixed-header">
        <NavbarTop/>
        <Header />
      <OfficerNavbar fullName={fullName} />
        
      </div>
      <div className="main-layout">
  <div className="content-below">
    
    <div className="dashboard-container">
      {/* Top Navigation Bar */}
      {/* <nav className="dashboard-nav">
        <div className="nav-brand">
          <span className="brand-icon">🏛️</span>
          <span className="brand-text">SewaDwaar</span>
        </div>
        <div className="nav-actions">
          <Link to="/dashboard" className="nav-icon-btn" title="Dashboard">
            <FaArrowLeft />
          </Link>
          <div className="nav-user">
            <FaUser />
            <span>{fullName}</span>
          </div>
          <button className="nav-icon-btn logout-btn" onClick={handleLogout} title="Logout">
            <FaSignOutAlt />
          </button>
        </div>
      </nav> */}

      <div className="dashboard-content" ref={reportRef}>
        {/* Header */}
        <header className="dashboard-header">
          <div className="header-text">
            <h1>📊 Reports & Analytics</h1>
            <p>View detailed appointment statistics and performance metrics</p>
          </div>
          <button className="download-report-btn" onClick={downloadPDF}>
            <FaDownload /> Download Report
          </button>
        </header>

        {/* Report Type Selector */}
        <div className="report-controls">
          <div className="report-type-tabs">
            <button
              className={`report-tab ${reportType === "monthly" ? "active" : ""}`}
              onClick={() => setReportType("monthly")}
            >
              <FaCalendarAlt /> Monthly
            </button>
            <button
              className={`report-tab ${reportType === "weekly" ? "active" : ""}`}
              onClick={() => setReportType("weekly")}
            >
              <FaCalendarWeek /> Weekly
            </button>
            <button
              className={`report-tab ${reportType === "custom" ? "active" : ""}`}
              onClick={() => setReportType("custom")}
            >
              <FaCalendarCheck /> Custom Range
            </button>
          </div>

          {/* Date Selectors */}
          <div className="date-selectors">
            {reportType === "monthly" && (
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="month-picker"
              />
            )}
            {reportType === "custom" && (
              <div className="custom-date-range">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  placeholder="Start Date"
                />
                <span>to</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  placeholder="End Date"
                />
                <button onClick={handleCustomDateSearch} className="search-btn">
                  Generate
                </button>
              </div>
            )}
          </div>
        </div>

        {reportData && (
          <>
            {/* Summary Cards */}
            <div className="report-summary-grid">
              <div className="report-card total">
                <div className="card-icon"><FaUsers /></div>
                <div className="card-content">
                  <span className="card-number">{reportData.summary.total_appointments}</span>
                  <span className="card-label">Total Appointments</span>
                </div>
              </div>
              <div className="report-card success">
                <div className="card-icon"><FaCheckCircle /></div>
                <div className="card-content">
                  <span className="card-number">{reportData.summary.completed}</span>
                  <span className="card-label">Completed</span>
                </div>
              </div>
              <div className="report-card info">
                <div className="card-icon"><FaTrophy /></div>
                <div className="card-content">
                  <span className="card-number">{reportData.summary.completion_rate}%</span>
                  <span className="card-label">Completion Rate</span>
                </div>
              </div>
              <div className="report-card warning">
                <div className="card-icon"><FaClock /></div>
                <div className="card-content">
                  <span className="card-number">{reportData.summary.pending}</span>
                  <span className="card-label">Pending</span>
                </div>
              </div>
              <div className="report-card danger">
                <div className="card-icon"><FaTimesCircle /></div>
                <div className="card-content">
                  <span className="card-number">{reportData.summary.rejected}</span>
                  <span className="card-label">Rejected</span>
                </div>
              </div>
              <div className="report-card purple">
                <div className="card-icon"><FaRedo /></div>
                <div className="card-content">
                  <span className="card-number">{reportData.summary.rescheduled}</span>
                  <span className="card-label">Rescheduled</span>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="charts-grid">
              {/* Daily Trend Chart */}
              <div className="chart-container large">
                <h3><FaChartLine /> Appointment Trends</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={reportData.daily_breakdown}>
                    <defs>
                      <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="colorApproved" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ 
                        background: 'white', 
                        border: 'none', 
                        borderRadius: '10px', 
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)' 
                      }} 
                    />
                    <Legend />
                    <Area type="monotone" dataKey="completed" stroke="#10b981" fillOpacity={1} fill="url(#colorCompleted)" name="Completed" />
                    <Area type="monotone" dataKey="approved" stroke="#3b82f6" fillOpacity={1} fill="url(#colorApproved)" name="Approved" />
                    <Line type="monotone" dataKey="pending" stroke="#f59e0b" strokeWidth={2} name="Pending" />
                    <Line type="monotone" dataKey="rejected" stroke="#ef4444" strokeWidth={2} name="Rejected" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Status Distribution Pie Chart */}
              <div className="chart-container">
                <h3><FaChartPie /> Status Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={reportData.status_distribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {reportData.status_distribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Hourly Distribution Bar Chart */}
              <div className="chart-container">
                <h3><FaChartBar /> Peak Hours</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={reportData.hourly_distribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="hour" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ 
                        background: 'white', 
                        border: 'none', 
                        borderRadius: '10px', 
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)' 
                      }} 
                    />
                    <Bar dataKey="appointments" fill="url(#barGradient)" radius={[8, 8, 0, 0]}>
                      <defs>
                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#667eea" />
                          <stop offset="100%" stopColor="#764ba2" />
                        </linearGradient>
                      </defs>
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Status Comparison Bar Chart */}
              <div className="chart-container large">
                <h3><FaChartBar /> Daily Status Breakdown</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={reportData.daily_breakdown.slice(-14)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{ 
                        background: 'white', 
                        border: 'none', 
                        borderRadius: '10px', 
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)' 
                      }} 
                    />
                    <Legend />
                    <Bar dataKey="completed" stackId="a" fill="#10b981" name="Completed" />
                    <Bar dataKey="approved" stackId="a" fill="#3b82f6" name="Approved" />
                    <Bar dataKey="pending" stackId="a" fill="#f59e0b" name="Pending" />
                    <Bar dataKey="rejected" stackId="a" fill="#ef4444" name="Rejected" />
                    <Bar dataKey="rescheduled" stackId="a" fill="#8b5cf6" name="Rescheduled" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Insights Section */}
            <div className="insights-section">
              <h3>💡 Key Insights & Recommendations</h3>
              <div className="insights-grid">
                <div className="insight-card">
                  <div className="insight-icon success">📈</div>
                  <div className="insight-content">
                    <h4>Completion Rate</h4>
                    <p>Your completion rate is <strong>{reportData.summary.completion_rate}%</strong>. 
                    {parseFloat(reportData.summary.completion_rate) >= 70 
                      ? " Excellent performance! Keep up the good work." 
                      : " Consider following up on pending appointments."}
                    </p>
                  </div>
                </div>
                <div className="insight-card">
                  <div className="insight-icon info">📅</div>
                  <div className="insight-content">
                    <h4>Peak Performance</h4>
                    <p>Highest activity on <strong>{reportData.summary.peak_day?.date}</strong> with {reportData.summary.peak_day?.total} appointments handled.</p>
                  </div>
                </div>
                <div className="insight-card">
                  <div className="insight-icon warning">⏱️</div>
                  <div className="insight-content">
                    <h4>Daily Average</h4>
                    <p>You handle an average of <strong>{reportData.summary.avg_daily}</strong> appointments per day.</p>
                  </div>
                </div>
                <div className="insight-card">
                  <div className="insight-icon danger">🔄</div>
                  <div className="insight-content">
                    <h4>Reschedule Rate</h4>
                    <p><strong>{((reportData.summary.rescheduled / reportData.summary.total_appointments) * 100).toFixed(1)}%</strong> of appointments were rescheduled. 
                    {parseFloat(reportData.summary.rescheduled / reportData.summary.total_appointments * 100) > 15 
                      ? " Consider reducing reschedules for better visitor experience." 
                      : " Within acceptable range."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <style jsx="true">{`
        .download-report-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          border: none;
          border-radius: 10px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        }

        .download-report-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
        }

        .report-controls {
          background: white;
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 24px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
        }

        .report-type-tabs {
          display: flex;
          gap: 12px;
          margin-bottom: 20px;
        }

        .report-tab {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          background: var(--gray-100);
          border: 2px solid transparent;
          border-radius: 10px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .report-tab:hover {
          background: var(--primary-light);
          border-color: var(--primary);
        }

        .report-tab.active {
          background: var(--primary);
          color: white;
          border-color: var(--primary);
        }

        .date-selectors {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .month-picker {
          padding: 12px 16px;
          border: 2px solid var(--gray-300);
          border-radius: 10px;
          font-size: 14px;
          cursor: pointer;
        }

        .month-picker:focus {
          outline: none;
          border-color: var(--primary);
        }

        .custom-date-range {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .custom-date-range input {
          padding: 12px 16px;
          border: 2px solid var(--gray-300);
          border-radius: 10px;
          font-size: 14px;
        }

        .custom-date-range span {
          color: var(--gray-500);
          font-weight: 500;
        }

        .report-summary-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }

        .report-card {
          background: white;
          border-radius: 16px;
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
          transition: all 0.3s;
        }

        .report-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        }

        .report-card .card-icon {
          width: 50px;
          height: 50px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          color: white;
        }

        .report-card.total .card-icon { background: linear-gradient(135deg, #667eea, #764ba2); }
        .report-card.success .card-icon { background: linear-gradient(135deg, #10b981, #059669); }
        .report-card.info .card-icon { background: linear-gradient(135deg, #3b82f6, #2563eb); }
        .report-card.warning .card-icon { background: linear-gradient(135deg, #f59e0b, #d97706); }
        .report-card.danger .card-icon { background: linear-gradient(135deg, #ef4444, #dc2626); }
        .report-card.purple .card-icon { background: linear-gradient(135deg, #8b5cf6, #7c3aed); }

        .card-content {
          display: flex;
          flex-direction: column;
        }

        .card-number {
          font-size: 24px;
          font-weight: 700;
          color: var(--gray-900);
        }

        .card-label {
          font-size: 12px;
          color: var(--gray-500);
          margin-top: 2px;
        }

        .charts-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
          margin-bottom: 24px;
        }

        .chart-container {
          background: white;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
        }

        .chart-container.large {
          grid-column: span 2;
        }

        .chart-container h3 {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 16px;
          color: var(--gray-900);
          margin-bottom: 20px;
          padding-bottom: 12px;
          border-bottom: 2px solid var(--gray-100);
        }

        .chart-container h3 svg {
          color: var(--primary);
        }

        .insights-section {
          background: white;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
        }

        .insights-section h3 {
          font-size: 18px;
          color: var(--gray-900);
          margin-bottom: 20px;
        }

        .insights-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        .insight-card {
          display: flex;
          gap: 16px;
          padding: 20px;
          background: linear-gradient(135deg, #f8f9ff, #f0f4ff);
          border-radius: 12px;
          border: 1px solid var(--gray-200);
        }

        .insight-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          flex-shrink: 0;
        }

        .insight-icon.success { background: #d1fae5; }
        .insight-icon.info { background: #dbeafe; }
        .insight-icon.warning { background: #fef3c7; }
        .insight-icon.danger { background: #fee2e2; }

        .insight-content h4 {
          font-size: 14px;
          color: var(--gray-900);
          margin-bottom: 6px;
        }

        .insight-content p {
          font-size: 13px;
          color: var(--gray-600);
          line-height: 1.5;
        }

        .insight-content strong {
          color: var(--gray-900);
        }

        @media (max-width: 1200px) {
          .report-summary-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        @media (max-width: 900px) {
          .report-summary-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .charts-grid {
            grid-template-columns: 1fr;
          }
          .chart-container.large {
            grid-column: span 1;
          }
          .insights-grid {
            grid-template-columns: 1fr;
          }
          .report-type-tabs {
            flex-wrap: wrap;
          }
        }

        @media (max-width: 600px) {
          .report-summary-grid {
            grid-template-columns: 1fr;
          }
          .custom-date-range {
            flex-direction: column;
            align-items: stretch;
          }
        }
      `}</style>
    </div>
    </div>
    </div>
    </>

  );
};

export default OfficerReports;