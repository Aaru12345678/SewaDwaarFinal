const express = require("express");
const router = express.Router();

const {
  loginHelpdesk,
  getHelpdeskDashboard,
  registerHelpdesk,
  bookWalkinAppointment,
  getOfficersForBooking,
  getAllAppointmentsByDepartment,
  getNotifications,
  getOfficerAvailability,
  getUserByMobileNo,
  getVisitorDetails
} = require("../controllers/helpdeskController");
// const {
//   getUserByMobileNo
// } = require('../controllers/userController');

const {
  getHelpdeskDashboardCounts
} = require('../controllers/helpdeskController');

router.get(
  '/helpdeskdashboard/:helpdesk_id',
  getHelpdeskDashboardCounts
);


// Get user + visitor info by mobile number
router.get(
  '/users/mobile/:mobile_no',
  getUserByMobileNo
);
router.get("/visitor", getVisitorDetails);

// Auth
router.post("/login", loginHelpdesk);
router.post("/register", registerHelpdesk);

router.get(
  '/helpdesks/:helpdesk_id/officers/availability',
  getOfficerAvailability
);


// Dashboard
router.get("/:helpdesk_id/dashboard", getHelpdeskDashboard);

// Walk-in
router.post("/book-walkin", bookWalkinAppointment);

// Officers (uses DB function)
router.post("/officers", getOfficersForBooking);

// Appointments by department (date-based)
router.get("/:helpdesk_id/appointments-by-department", getAllAppointmentsByDepartment);

// Notifications (location-based)
router.get("/:helpdesk_id/notifications", getNotifications);

module.exports = router;
