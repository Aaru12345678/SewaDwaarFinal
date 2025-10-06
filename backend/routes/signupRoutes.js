const express = require("express");
const router = express.Router();
const { insertVisitorSignup, login} = require("../controllers/signupController");
const multer = require("multer");

const upload = multer({ dest: "uploads/" });

router.post("/signup", upload.single("photo"), insertVisitorSignup);
router.post("/login", login);



module.exports = router;
