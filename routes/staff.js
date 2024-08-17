const express = require("express");
const { adminProtect, protect } = require("../middleware/auth");
const {
  addStaff,
  getAllStaff,
  resetpass,
  updateStaff,
  deleteStaff,
  resetPassword,
  getStaff,
} = require("../controllers/StaffManagement/staff");
const multer = require("multer");
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

const router = express.Router();

router.route("/").post(adminProtect, addStaff).get(adminProtect, getAllStaff);

router
  .route("/:id")
  .get(protect, getStaff)
  .put([imageSetting.single("file")], protect, updateStaff)
  .delete(deleteStaff);

router.route("/resetpassword").post(resetPassword);

// router.route("/:id").get(getMailUser);

module.exports = router;
