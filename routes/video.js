const express = require("express");
const uuid = require("uuid").v4;
const fs = require("fs");
const path = require("path");
const commentRouter = require("./comment");

const {
  createVideo,
  getAllVideo,
  editVideo,
  getVideo,
  deleteVideo,
  challengeVideo,
  getUserVideos,
  getMostLikedVideo,
} = require("../controllers/VideoManagement/video");
const router = express.Router();
const {
  protect,
  adminProtect,
  authenticateUser,
} = require("../middleware/auth");

const multer = require("multer");
const { voteVideo } = require("../controllers/VideoManagement/Voting/vote");

const winnerRouter = require("./winner");

const monitizeRouter = require("./monitization");

const reportRouter = require("./reportVideo");

// const storage = multer.memoryStorage();
const imageStorage = multer.memoryStorage();

const uploadsDir = path.join(__dirname, "../uploads");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const { originalname } = file;
    cb(null, `${uuid()}-${originalname}`);
  },
});

const upload = multer({
  storage,
});
const fileFilter = (req, file, cb) => {
  if (file.mimetype.split("/")[0] === "image") {
    cb(null, true);
  } else {
    cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE"), false);
  }
};
const imageSetting = multer({
  storage: imageStorage,
  fileFilter,
  limits: { fileSize: 5000000, files: 1 },
});

//COMMENT
router.use("/comment", commentRouter);

//monitization
router.use("/monitize", monitizeRouter);

//Winner
router.use("/winner", winnerRouter);

//REPORT VIDEO
router.use("/report", reportRouter);
//VIDEOS
router
  .route("/")
  .get(/*authenticateUser*/ getAllVideo)
  .post([upload.single("file"), protect], createVideo);
// router.route("/status").put(protect, statusVideo);
router.route("/vote").post(protect, voteVideo);

router.route("/challenge/:challengeId").get(protect, challengeVideo);
router.route("/my/:userId").get(protect, getUserVideos); //get the user Videos
router.route("/mostliked/:id").get(getMostLikedVideo);
router
  .route("/:videoId")
  .put(protect, editVideo)
  .get(getVideo)
  // @desc delvideo
  .delete(protect, deleteVideo);

module.exports = router;
