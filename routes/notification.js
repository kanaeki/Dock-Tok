const express = require("express");
const { protect, adminProtect } = require("../middleware/auth");
const {
  getAll,
  readNotification,
  readAllNotification,
} = require("../controllers/Notification/notification");
const router = express.Router();

router.route("/").get(protect, getAll).put(protect, readNotification);
router.route("/test").post(protect, function (req, res, next) {
  if (notification(req.body)) {
    return res.status(201).json({
      success: true,
      message: "Notification successfully Sent!",
    });
  } else {
    return next(new ErrorResponse("Something Went Wrong", 400));
  }
});
router
  .route("/all")
  .post(protect, function (req, res, next) {
    if (sendNotificationToAll(req.body)) {
      return res.status(201).json({
        success: true,
        message: "Notification successfully Sent!",
      });
    } else {
      return next(new ErrorResponse("Something Went Wrong", 400));
    }
  })
  .put(protect, readAllNotification);
module.exports = router;
