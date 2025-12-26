const express = require("express");
const router = express.Router();
const visitorController = require("../controllers/visitorController");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { verifyToken } = require("../helpers/middleware");
const UPLOAD_DIR = path.join(__dirname, "../uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
// const verifyToken=require("../helpers/middleware")

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}_${Math.round(Math.random() * 1e9)}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 200 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/jpg", "image/png"];
    allowed.includes(file.mimetype)
      ? cb(null, true)
      : cb(new Error("Only JPG, JPEG, PNG files allowed"));
  }
});

router.get("/:username/dashboard", visitorController.getVisitorDashboard);
router.get("/profile/:visitor_id", visitorController.getVisitorProfile);

router.put(
  "/profile/:visitor_id",
  upload.single("photo"),   // ✅ multer runs here
  visitorController.updateVisitorProfile
);

router.put("/change-password/:visitor_id", visitorController.changePassword);
// unread notifications count:
router.get(
  "/notifications/unreadcount",
  visitorController.getUnreadNotificationCount
);

router.put(
  "/visitor/notifications/mark-read",
  verifyToken,
  visitorController.markNotificationsAsRead
);


module.exports = router;
