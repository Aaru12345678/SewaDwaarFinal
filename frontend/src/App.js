import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// login pages
import Login from "./Components/Login";
import SignUp from "./Components/SignUp";

// Visitor pages
import VisitorDashboard from "./pages/VisitorDashboard";
import AppointmentWizard from "./pages/AppointmentWizard";
import AppointmentPass from "./pages/AppointmentPass";
import AppointmentList from "./pages/AppointmentList";
import Notifications from "./pages/Notifications";
import VisitorNavbar from "./pages/VisitorNavbar";
import AppointmentDetails from "./pages/AppointmentDetails";


// 
import OfficerLogin from './Components/OfficerLogin';
// import SignUp from './Components/SignUp';
import ForgotPassword from './pages/ForgotPassword';
// import VerifyOTP from './pages/VerifyOTP';
import ResetPassword from './pages/ResetPassword';
import LoginEntry from './Components/LoginEntry';
import Home from "./pages/Home";
// import AdminRequest from './pages/AdminRequest';
// import Upload from './pages/Upload';
// import AddScheme from './pages/AddScheme';
import Dashboard from './pages/Dashboard';
import MainPage from './pages/MainPage';
import ChangePassword from './pages/ChangePassword';
import Contact from "./pages/Contact";
import About from "./pages/About";
import Help from "./pages/Help";
import AdminDashboard from './pages/AdminDash';
// import SchemeDataPage from './pages/SchemeDataPage';
import ApprovalList from './pages/ApprovalList';
import TodayAppointments from "./pages/TodayAppointments";
import AppointmentAction from "./pages/AppointmentAction";
// import Notifications from "./pages/Notifications";
import History from "./pages/History";
import { ToastContainer, toast } from 'react-toastify';
import { useLocation, Navigate } from 'react-router-dom';


// 


// Admin pages
import Dashboard1 from "./pages/admin"; // Admin dashboard (includes sidebar now)


function App() {
  // 

const loggedIn = !!localStorage.getItem("token");

  // PrivateRoute wrapper
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
    // { path: "AdminRequest", element: <AdminRequest /> },
    // { path: "AddScheme", element: <AddScheme /> },
    { path: "admindash", element: <AdminDashboard /> },
    // { path: "upload", element: <Upload /> },
    // { path: "viewdata", element: <SchemeDataPage /> },
    { path: "approval", element: <ApprovalList /> },
  ];
  // 
  return (
    <Router>
      <Routes>

         <Route path="/signup" element={<SignUp />} />
        <Route path="/login/visitorlogin" element={<Login />} /> 

        {/* Visitor Routes with Navbar */}
        <Route
          path="/dashboard1"
          element={
            <>
              <VisitorNavbar />
              <VisitorDashboard />
            </>
          }
        />
        <Route
          path="/appointment-wizard"
          element={
            <>
              <VisitorNavbar />
              <AppointmentWizard />
            </>
          }
        />
        <Route
          path="/appointment-pass/:id"
          element={
            <>
              <VisitorNavbar />
              <AppointmentPass />
            </>
          }
        />
        <Route
          path="/appointments"
          element={
            <>
              <VisitorNavbar />
              <AppointmentList />
            </>
          }
        />
        <Route
          path="/appointment/:id"
          element={
            <>
              <VisitorNavbar />
              <AppointmentDetails />
            </>
          }
        />
        <Route
          path="/notifications"
          element={
            <>
              <VisitorNavbar />
              <Notifications />
            </>
          }
        />

        {/* Admin Route with Nested Pages */}
        <Route path="/admin/*" element={<Dashboard1 />} />


{/*  */}
<Route path="/login" element={<LoginEntry />} />
          {/* <Route path="/signup" element={<SignUp />} /> */}
          <Route path="/OfficerLogin" element={<OfficerLogin />} />

          {/* Forgot password flow */}
          <Route path="/forgot" element={<ForgotPassword />} />
          {/* <Route path="/verify" element={<VerifyOTP />} /> */}
          <Route path="/reset" element={<ResetPassword />} />

          {/* Main layout */}
          <Route path="/" element={<MainPage />}>
            <Route index element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="contact" element={<Contact />} />
            <Route path="help" element={<Help />} />
            <Route path="dashboard" element={loggedIn ? <Navigate to="/admindash" replace /> : <Dashboard />} />

                    {/* Officer main dashboard */}
        <Route path="/officer" element={<Dashboard />} />

        {/* Subpages */}
        <Route path="/officer/today" element={<TodayAppointments />} />
        <Route path="/officer/action/:id" element={<AppointmentAction />} />
        <Route path="/officer/notifications" element={<Notifications />} />
        <Route path="/officer/history" element={<History />} />


            {/* Protected routes */}
            {protectedRoutes.map(({ path, element }) => (
              <Route
                key={path}
                path={path}
                element={<PrivateRoute>{element}</PrivateRoute>}
              />
            ))}
          </Route>
{/*  */}


      </Routes>
      <ToastContainer position="top-right" autoClose={3000} />

    </Router>
  );
}

export default App;
