const express = require("express");
const router = express.Router();
const multer = require("multer");
const { protect } = require("../middleware/auth");
const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  if (file.mimetype.split("/")[0] === "image") {
    cb(null, true);
  } else {
    cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE"), false);
  }
};
// ["image", "jpeg"]
const video = multer({
  storage,

  limits: { fileSize: 5000000000000, files: 1 },
});

// ["image", "jpeg"]
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5000000, files: 1 },
});
const multiUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 20000000000, files: 8 },
});

// Controllers

const {
  mediaUpload,
  multiMediaUpload,
  videoUpload,
} = require("../controllers/Upload/media");
router.route("/video").post([video.single("file")], videoUpload);
router.route("/upload").post([upload.single("file"), protect], mediaUpload);
router
  .route("/multiupload")
  .post([multiUpload.array("files"), protect], multiMediaUpload);
router
  .route("/test")
  .post([upload.single("file"), protect], async (req, res, next) => {
    console.log(req, "---------------------");
    return await res.send({ body: req.body, files: req.file });
  });

module.exports = router;
