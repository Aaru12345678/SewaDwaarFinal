const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");


const { loginOfficer } = require("../controllers/officerController");
// or authController.js if you moved it

router.post("/login", loginOfficer);

router.post("/forgot-password/send-otp", authController.sendForgotPasswordOtp);
router.post("/forgot-password/reset", authController.resetPasswordWithOtp);

module.exports = router;