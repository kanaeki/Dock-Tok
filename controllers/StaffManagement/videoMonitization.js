const ErrorResponse = require("../../utils/errorResponse");
const Video = require("../../models/Video");

const { MESSAGE } = require("../../Constant/message");
const { createNotification } = require("../../utils/notification");
const User = require("../../models/User");

// @desc    update the Status of the video
exports.videoApproval = async (req, res, next) => {
  try {
    // send Response
    const { dataStatus, videoId, comment, userId } = req.body;
    let video;
    if (!dataStatus || !videoId) {
      return next(new ErrorResponse(MESSAGE.INVALID_DATA_REQUEST, 400));
    }
    if (dataStatus === "REJECTED") {
      if (!comment) {
        return next(new ErrorResponse(MESSAGE.INVALID_DATA_REQUEST, 400));
      }
      video = await Video.findByIdAndUpdate(
        videoId,
        {
          dataStatus: dataStatus,
          "additionalInfo.comment": comment,
        },
        {
          new: true,
        },
      );
      //NOTIFICATION
      const videoThumnail = await Video.findOne({
        _id: videoId,
      }).select("videoDetail.thumbnail.path");
      const fcm = await User.findOne(
        { _id: userId },
        { fcmApp: 1, firstName: 1 },
      );
      await createNotification(
        (title = "Video Approval"), //title
        (message = `${fcm.firstName} ${MESSAGE.VIDEO_REJECTED}`), //message
        (recipient = userId), //recipient id
        (fcmAndroidApp = fcm.fcmApp), //recipient fcm
        (data = {
          action: "Video Rejected",
          id: videoId,
          thumbnail: videoThumnail.videoDetail.thumbnail.path,
        }), //Additional data
        (type = "APPROVAL"), //TYPE
        (sender = req.user._id), //sender
      );
    } else {
      video = await Video.findByIdAndUpdate(
        videoId,
        {
          dataStatus: dataStatus,
        },
        {
          new: true,
        },
      );
      //NOTIFICATION
      const videoThumbnail = await Video.findOne({
        _id: videoId,
      }).select("videoDetail.thumbnail.path");
      const fcm = await User.findOne(
        { _id: userId },
        { fcmApp: 1, firstName: 1 },
      );
      await createNotification(
        (title = "Video Approval"), //title
        (message = `${fcm.firstName} ${MESSAGE.VIDEO_APPROVAL}`), //message
        (recipient = userId), //recipient id
        (fcmAndroidApp = fcm.fcmApp), //recipient fcm
        (data = {
          action: "Video Approval",
          id: videoId,
          thumbnail: videoThumbnail.videoDetail.thumbnail.path,
        }), //Additional data
        (type = "APPROVAL"), //TYPE
        (sender = req.user._id), //sender
      );
    }

    return res.status(201).json({
      success: true,
      message: MESSAGE.VIDEO_STATUS,
      data: video,
    });
  } catch (err) {
    return next(new ErrorResponse(err, 400));
  }
};
