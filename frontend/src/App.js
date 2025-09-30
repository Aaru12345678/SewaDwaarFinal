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

// Admin pages
import Dashboard from "./pages/admin"; // Admin dashboard (includes sidebar now)


function App() {
  return (
    <Router>
      <Routes>

         <Route path="/signup" element={<SignUp />} />
        <Route path="/" element={<Login />} /> 

        {/* Visitor Routes with Navbar */}
        <Route
          path="/dashboard"
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

        {/* Admin Route */}
        <Route path="/admin" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
