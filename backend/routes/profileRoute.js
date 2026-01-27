const express = require("express");
const router = express.Router();
const { getMyProfile } = require("../controllers/profileController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/me", authMiddleware, getMyProfile);

module.exports = router;