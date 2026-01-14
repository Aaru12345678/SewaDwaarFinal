const express = require("express");
const router = express.Router();
const { insertMultipleServices,getServiceById } = require("../controllers/servicesController");

router.post("/insert-multiple", insertMultipleServices);

router.get("/:service_id", getServiceById);


module.exports = router;

