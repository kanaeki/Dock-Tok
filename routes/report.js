const express = require("express");
const { appleReport } = require("../controllers/apple");

const router = express.Router();
const { protect } = require("../middleware/auth");
// Controllers

router.route("/apple").get(protect, appleReport);

module.exports = router;
