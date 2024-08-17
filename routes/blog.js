const express = require("express");
const router = express.Router();
const categoryRouter = require("./category");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const {
  createBlog,
  getBlogs,
  deleteBlog,
  updateBlog,
  getBlog,
  getAllBlogs,
} = require("../controllers/Blog/blog");
const {
  adminProtect,
  protect,
  authenticateStaff,
} = require("../middleware/auth");
const uuid = require("uuid").v4;

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
//CATEGORY
router.use("/category", categoryRouter);

router
  .route("/")
  .post([upload.single("file"), authenticateStaff], createBlog)
  .get(getAllBlogs);

router
  .route("/:blogId")
  .get(getBlog) //for a specific ID
  .delete(authenticateStaff, deleteBlog)
  .put([upload.single("file"), authenticateStaff], updateBlog);
module.exports = router;
