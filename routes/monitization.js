const express = require("express");
const {
  adminProtect,
  protect,
  authenticateStaff,
} = require("../middleware/auth");
const {
  videoApproval,
} = require("../controllers/StaffManagement/videoMonitization");

const router = express.Router();

router.route("/").put(authenticateStaff, videoApproval);

module.exports = router;
