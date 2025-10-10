import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";

// Login & Signup pages
import Login from "./Components/Login";
import SignUp from "./Components/SignUp";
import LoginEntry from "./Components/LoginEntry";
import OfficerForm from "./Components/OfficerForm";

// Visitor pages
import VisitorDashboard from "./pages/VisitorDashboard";
import AppointmentWizard from "./pages/AppointmentWizard";
import AppointmentPass from "./pages/AppointmentPass";
import AppointmentList from "./pages/AppointmentList";
import Notifications from "./pages/Notifications";
import AppointmentDetails from "./pages/AppointmentDetails";
import Profile from "./pages/Profile";
import Logout from "./pages/Logout";

// Password flow
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

// Main & general pages
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import MainPage from "./pages/MainPage";
import ChangePassword from "./pages/ChangePassword";
import Contact from "./pages/Contact";
import About from "./pages/About";
import Help from "./pages/Help";

// Admin pages
import AdminDashboard from "./pages/AdminDash";
import ApprovalList from "./pages/ApprovalList";
import Dashboard1 from "./pages/admin";

// Officer pages
import TodayAppointments from "./pages/TodayAppointments";
import AppointmentAction from "./pages/AppointmentAction";
import History from "./pages/History";

function App() {
  const loggedIn = !!localStorage.getItem("token");

  const PrivateRoute = ({ children }) => {
    const location = useLocation();
    if (!loggedIn) {
      toast.error("You must be logged in to access this page");
      return <Navigate to="/LoginEntry" state={{ from: location }} replace />;
    }
    return children;
  };

  const protectedRoutes = [
    { path: "change-password", element: <ChangePassword /> },
    { path: "admindash", element: <AdminDashboard /> },
    { path: "approval", element: <ApprovalList /> },
  ];

  return (
    <Router>
      <Routes>
        {/* Auth Routes */}
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login/visitorlogin" element={<Login />} />
        <Route path="/officers_signup" element={<OfficerForm />} />
        <Route path="/login" element={<LoginEntry />} />

        {/* Forgot Password Flow */}
        <Route path="/forgot" element={<ForgotPassword />} />
        <Route path="/reset" element={<ResetPassword />} />

        {/* Visitor Routes */}
        <Route path="/dashboard1" element={<VisitorDashboard />} />
        <Route path="/appointment-wizard" element={<AppointmentWizard />} />
        <Route path="/appointment-pass/:id" element={<AppointmentPass />} />
        <Route path="/appointments" element={<AppointmentList />} />
        <Route path="/appointment/:id" element={<AppointmentDetails />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/logout" element={<Logout />} />

        {/* Admin Dashboard (nested) */}
        <Route path="/admin/*" element={<Dashboard1 />} />

        {/* Officer Routes */}
        <Route path="/officer" element={<Dashboard />} />
        <Route path="/officer/today" element={<TodayAppointments />} />
        <Route path="/officer/action/:id" element={<AppointmentAction />} />
        <Route path="/officer/notifications" element={<Notifications />} />
        <Route path="/officer/history" element={<History />} />

        {/* Main Layout */}
        <Route path="/" element={<MainPage />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="help" element={<Help />} />
          <Route
            path="dashboard"
            element={loggedIn ? <Navigate to="/admindash" replace /> : <Dashboard />}
          />
          {protectedRoutes.map(({ path, element }) => (
            <Route
              key={path}
              path={path}
              element={<PrivateRoute>{element}</PrivateRoute>}
            />
          ))}
        </Route>
      </Routes>

      <ToastContainer position="top-right" autoClose={3000} />
    </Router>
  );
}

export default App;
