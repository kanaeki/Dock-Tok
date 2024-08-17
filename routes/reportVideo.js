const express = require("express");
const {
  createFlag,
  getAllFlagVideos,
  getFlagVideo,
} = require("../controllers/VideoManagement/ReportVideo/flagVideo");
const { adminProtect, protect } = require("../middleware/auth");
const router = express.Router();

router.route("/").post(protect, createFlag);
router.route("/all").get(adminProtect, getAllFlagVideos);
router.route("/:videoId").get(adminProtect, getFlagVideo);
module.exports = router;
