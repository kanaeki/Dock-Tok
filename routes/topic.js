const express = require("express");
const { protect, authenticateStaff } = require("../middleware/auth");
const multer = require("multer");
const {
  deleteTopic,
  getAllTopic,
  createTopic,
  getTopic,
  editTopic,
  archiveTopic,
  getEventStats,
} = require("../controllers/VideoManagement/Topics/topic");
const router = express.Router();
const path = require("path");
const uuid = require("uuid").v4;
const fs = require("fs");

const imageStorage = multer.memoryStorage();

const uploadsDir = path.join(__dirname, "../uploads"); // Adjust path if necessary

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
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
  if (file?.mimetype.split("/")[0] === "image") {
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
router
  .route("/")
  .get(getAllTopic)
  .post([upload.single("file"), authenticateStaff], createTopic);
router.route("/stats").get(protect, getEventStats);
router
  .route("/:topicId")
  .get(protect, getTopic)
  .put([upload.single("file"), authenticateStaff], editTopic)
  .delete(authenticateStaff, deleteTopic);

router.route("/archive/:topicId").put(authenticateStaff, archiveTopic);

module.exports = router;
