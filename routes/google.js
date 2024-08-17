const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
// Controllers
const {
  getYouTubeChannelDetail,
  subscribeYoutubeChannel,
} = require("../controllers/Authentication/GoogleAuth");

router.route("/youtube/subscriptions").post(protect, subscribeYoutubeChannel);
router.route("/youtube/subscriptions").get(protect, getYouTubeChannelDetail);

module.exports = router;
