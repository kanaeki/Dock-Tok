const express = require("express");
const { flushdb } = require("../controllers/Flush/flushdb");
const router = express.Router();

router.route("/").get(flushdb);

module.exports = router;
