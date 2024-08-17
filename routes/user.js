const express = require("express");
const { protect, adminProtect } = require("../middleware/auth");
const multer = require("multer");
const {
  userStat,
  allUserStats,
  adminCards,
} = require("../controllers/UserManagement/stat");
const {
  getUserProfile,
  updateUserProfile,
  disableUser,
  blockUser,
  getAllUsers,
  userTrafficGraph,
  userRegistrationGraph,
  storeFCMToken,
  updateFcmApp,
  enableUser,
  getDockies,
  delUser,
} = require("../controllers/UserManagement/user");
const notificationRouter = require("./notification.js");
const { weekLog } = require("../controllers/UserManagement/logs.js");
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

router.use("/notification", notificationRouter);
// (ADMIN)
router.get("/", protect, getAllUsers);
router.route("/getdockies").get(getDockies);
router.route("/graph").get(userRegistrationGraph);
router.route("/usertraffic").get(userTrafficGraph);
//Get Weekly Logs
router.route("/weeklylogs").get(adminProtect, weekLog);

//Store the Fcm Token
router.route("/fcm").post(protect, storeFCMToken);

router.route("/updatefcm").get(adminProtect, updateFcmApp);

//
router.route("/stat/all").get(adminProtect, allUserStats);
router.route("/stat/admin").get(adminProtect, adminCards);

router
  .route("/:userId")
  .put([imageSetting.single("file"), protect], updateUserProfile)
  .get(protect, getUserProfile);
router.route("/stat/:userId").get(protect, userStat);
// BloCk the User From App
router.route("/disable/:userId").put(adminProtect, disableUser);

router.route("/enable/:userId").put(adminProtect, enableUser);

//Report a User
router.route("/block/:userId").get(protect, blockUser);
router.route("/del/:email").delete(adminProtect, delUser);

module.exports = router;
