const express = require("express");
const { protect, adminProtect } = require("../middleware/auth");
const router = express.Router();
const {
  createWinner,
  getAllwinners,
  getuserWinner,
  getAwardByVideo,
  getWinnerVideoCount,
  deleteWinner,
} = require("../controllers/Award/winner");
router.route("/").post(adminProtect, createWinner);
router.route("/").get(getAllwinners);

router.route("/count").get(getWinnerVideoCount);
router.route("/:id").delete(adminProtect, deleteWinner);
router.route("/my/:userId").get(protect, getuserWinner);
router.route("/:videoId/:userId").get(getAwardByVideo);

module.exports = router;
