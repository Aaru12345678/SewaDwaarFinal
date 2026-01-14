import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";

// Login & Signup pages
import Login from "./Components/Login";
import SignUp from "./Components/SignUp";
import LoginEntry from "./Components/LoginEntry";
import OfficerForm from "./Components/OfficerForm";
import OfficerLogin from "./Components/OfficerLogin";
import AdminLogin from "./Components/AdminLogin";
// Visitor pages
import VisitorDashboard from "./pages/VisitorDashboard";
import AppointmentWizard from "./pages/AppointmentWizard";
import AppointmentPass from "./pages/AppointmentPass";
import AppointmentList from "./pages/AppointmentList";
import Notifications from "./pages/Notifications";
import AppointmentDetails from "./pages/AppointmentDetails";
import Profile from "./pages/Profile";
import Logout from "./pages/Logout";

// helpdesk
import HelpdeskDashboard from "./pages/HelpdeskDashboard";
import HelpdeskLogin from "./Components/HelpdeskLogin";
import HelpdeskProtectedRoute from "./Components/HelpdeskProtectedRoute";

// Password flow
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

// Main & general pages
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import OfficerReport from "./pages/OfficerReport"
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

import AddTypeEntry from "./Components/AddTypeEntry";
import AddOrganization from "./pages/AddOrganization";
import AddDepartment from "./pages/AddDepartment";
import AddServices from "./pages/AddServices";
import AddHoliday from "./pages/AddHoliday";
import EditProfile from "./pages/EditProfile";
import AppointmentWizard2 from "./pages/AppointmentWizard2";
import OfficerNotifications from "./pages/OfficerNotifications";
import EditOrganization from "./pages/EditOrganization";
import EditDepartment from './pages/EditDepartment';
import EditServices from "./pages/EditServices";
import OfficerAvailability from "./pages/OfficerAvailability";
import SearchUserByMobile from './pages/SearchUserByMobile';
import HelpdeskBooking from "./pages/HelpdeskBooking";
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
    // { path: "change-password", element: <ChangePassword /> },
    { path: "admindash", element: <AdminDashboard /> },
    { path: "approval", element: <ApprovalList /> },
  ];

  return (
    <Router>
      <Routes>
        {/* Auth Routes */}
        <Route path= "change-password" element={<ChangePassword />}/>
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login/visitorlogin" element={<Login />} />
        <Route path="/register-officer" element={<OfficerForm />} />
        <Route path="/login" element={<LoginEntry />} />
        
        {/* Officer login */}
        <Route path="/login/officerlogin" element={<OfficerLogin />} />

        {/* Admin login */}
        <Route path="/login/adminlogin" element={<AdminLogin />} />
        
        {/* Forgot Password Flow */}
        <Route path="/forgot" element={<ForgotPassword />} />
        <Route path="/reset" element={<ResetPassword />} />

 {/* Helpdesk login */}
        <Route path="/login/helpdesklogin" element={<HelpdeskLogin />} />
        {/* Helpdesk Routes - Protected */}
        <Route path="/helpdesk/dashboard" element={<HelpdeskProtectedRoute><HelpdeskDashboard /></HelpdeskProtectedRoute>} />
        <Route path="/helpdesk/availability" element={<OfficerAvailability />} />
        {/* <Route path="/helpdesk/bookappointment" element={<HelpdeskBooking />} /> */}




      
        {/* Visitor Routes */}
        <Route path="/dashboard1" element={<VisitorDashboard />} />
        <Route path="/appointment-wizard" element={<AppointmentWizard />} />
        <Route path="/appointment-wizard2" element={<AppointmentWizard2 />} />
        <Route path="/appointment-pass/:id" element={<AppointmentPass />} />
        <Route path="/appointments" element={<AppointmentList />} />
        <Route path="/appointment/:id" element={<AppointmentDetails />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/edit-profile" element ={<EditProfile/>}/>

        {/* Admin Dashboard (nested) */}
        <Route path="/admin/*" element={<Dashboard1 />} />
    
        {/* Add Type Modal */}
        <Route path="/addtype" element={<AddTypeEntry />} />

        {/* Add Organization / Department / Services */}
        <Route path="/add/organization" element={<AddOrganization />} />
        <Route path="/add/department" element={<AddDepartment />} />
        <Route path="/add/services" element={<AddServices />} />

        <Route path="/add/holiday" element={<AddHoliday/>}/>
        {/* Edit organization,department,services pages */}
        <Route path="/edit-organization/:id" element={<EditOrganization/>}/>
        <Route path="/edit-department/:department_id" element={<EditDepartment/>}/>
        <Route path="/edit-service/:service_id" element={<EditServices/>}/>
        {/*  */}
        {/* Officer Routes */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/officer/today" element={<TodayAppointments />} />
        <Route path="/officer/action/:id" element={<AppointmentAction />} />
        <Route path="/officer/notifications" element={<Notifications />} />
        <Route path="/officer/history" element={<History />} />
        <Route path="/officer/reports" element={<OfficerReport/>}/>
        <Route path="/officer/notifications2" element={<OfficerNotifications/>}/>
        
        {/* Main Layout */}
        <Route path="/" element={<MainPage />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="help" element={<Help />} />
          <Route
            path="/dashboard"
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
        <Route path="/helpdesk/search-user" element={<SearchUserByMobile />} />
      </Routes>

      <ToastContainer position="top-right" autoClose={3000} />
    </Router>
  );
}

export default App;
