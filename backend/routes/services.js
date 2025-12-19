const express = require("express");
const router = express.Router();
const { insertMultipleServices } = require("../controllers/servicesController");

router.post("/insert-multiple", insertMultipleServices);

module.exports = router;

