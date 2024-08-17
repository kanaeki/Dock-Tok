const express = require("express");
const {
  getAllCategory,
  createCategory,
  deleteCategory,
  updateCategory,
} = require("../controllers/Blog/category");
const { adminProtect } = require("../middleware/auth");
const multer = require("multer");

const router = express.Router();
const fileFilter = (req, file, cb) => {
  if (file.mimetype.split("/")[0] === "image") {
    cb(null, true);
  } else {
    cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE"), false);
  }
};
const imageStorage = multer.memoryStorage();
const imageSetting = multer({
  storage: imageStorage,
  fileFilter,
  limits: { fileSize: 5000000, files: 1 },
});

router
  .route("/")
  .get(adminProtect, getAllCategory)
  .post([imageSetting.single("file"), adminProtect], createCategory);

router
  .route("/:categoryId")
  .delete(adminProtect, deleteCategory)
  .put(adminProtect, updateCategory);
module.exports = router;
