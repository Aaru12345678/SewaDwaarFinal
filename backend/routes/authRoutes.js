const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.post("/forgot-password/send-otp", authController.sendForgotPasswordOtp);
router.post("/forgot-password/reset", authController.resetPasswordWithOtp);

module.exports = router;