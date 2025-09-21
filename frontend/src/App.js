import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Visitor pages
import VisitorDashboard from "./pages/VisitorDashboard";
import AppointmentWizard from "./pages/AppointmentWizard";
import AppointmentPass from "./pages/AppointmentPass";
import AppointmentList from "./pages/AppointmentList";
import Notifications from "./pages/Notifications";
import VisitorNavbar from "./pages/VisitorNavbar";
import AppointmentDetails from "./pages/AppointmentDetails";
// Admin pages
import Dashboard from "./pages/admin";   // Admin dashboard
import Sidebar from "./pages/Sidebar";   // Admin Sidebar
import Navbar from "./pages/Navbar";     // Admin Navbar

function App() {
  return (
    <Router>
      <Routes>
        {/* Visitor Routes with Navbar */}
        <Route
          path="/"
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

        {/* Admin Route with Sidebar + Navbar */}
        <Route
          path="/admin"
          element={
            <div className="app">
              <Sidebar />
              <div className="main">
                <Navbar />
                <Dashboard />
              </div>
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
