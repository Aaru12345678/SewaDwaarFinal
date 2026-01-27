const express = require("express");
const router = express.Router();
const { insertVisitorSignup, login,changePassword,insertVisitorSignupWalkin} = require("../controllers/signupController");
const multer = require("multer");
const path = require("path");
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const visitorId = req.body.visitor_id || Date.now();
    cb(null, `${visitorId}${ext}`);
  },
});

const upload = multer({ storage });

router.post("/signup", upload.single("photo"), insertVisitorSignup);
router.post("/walkinsignup", insertVisitorSignupWalkin);

router.post("/login", login);
router.post("/change-password", changePassword);



module.exports = router;
