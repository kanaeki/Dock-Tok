const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
// Controllers
const {
  getLikeFacebook,
} = require("../controllers/Authentication/FacebookAuth");

router.route("/like").get(protect, getLikeFacebook);

module.exports = router;
