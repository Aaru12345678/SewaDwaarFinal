const express = require('express');
const router = express.Router();
const {insertVisitorSignup,login}=require('../controllers/signupController');

router.post('/signup',insertVisitorSignup);
router.post('/',login);

module.exports=router;