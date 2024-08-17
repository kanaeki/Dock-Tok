const { MESSAGE } = require("../../../Constant/message");
const Video = require("../../../models/Video");
const Vote = require("../../../models/Vote");

const ErrorResponse = require("../../../utils/errorResponse");
const { createNotification } = require("../../../utils/notification");

// @desc    Create Vote
exports.voteVideo = async (req, res, next) => {
  try {
    // send Response
    let vote;
    const { like, videoId } = req.body;
    if (!like && !videoId) {
      return next(new ErrorResponse(MESSAGE.INVALID_DATA_REQUEST, 400));
    }
    const getVideo = await Vote.findOne({
      videoId: videoId,
      createdBy: req.user._id,
    });
    if (!getVideo) {
      vote = await Vote.create({
        like,
        videoId,
        createdBy: req.user._id,
        modifiedBy: req.user._id,
      });
      const recipientUser = await Video.findOne({ _id: videoId }).populate(
        "createdBy",
        "_id fcmApp",
      );
      const video = await Video.findOne({
        _id: videoId,
      }).select("videoDetail.thumbnail.path");
      if (
        JSON.stringify(recipientUser.createdBy._id) !==
        JSON.stringify(req.user._id)
      ) {
        await createNotification(
          (title = "New Vote"), //title
          (message = `${req.user.firstName} ${MESSAGE.VOTE_MESSAGE_NOTIFICATION}`), //message
          (recipient = recipientUser.createdBy._id), //recipient id
          (fcmAndroidApp = recipientUser.createdBy.fcmApp), //recipient fcm
          (data = {
            action: "Video Vote ",
            id: videoId.toString(),
            thumbnail: video.videoDetail.thumbnail.path,
          }), //Additional data
          (type = "VOTE"), //TYPE
          (sender = req.user._id), //sender
        );
      }
      res.status(200).json({
        success: true,
        message: MESSAGE.VOTE_CREATE_SUCCESS,
        data: vote,
      });
    } else {
      if (getVideo.like !== like) {
        vote = await Vote.findOneAndUpdate(
          { createdBy: req.user._id },
          { like: like },
        );
        return res.status(200).json({
          success: true,
          message: MESSAGE.VOTE_UPDATE_SUCCESS,
          data: vote,
        });
      } else {
        vote = await Vote.findOneAndDelete({
          createdBy: req.user._id,
          videoId: videoId,
        });
        return res.status(200).json({
          success: true,
          message: MESSAGE.VOTE_UPDATE_SUCCESS,
        });
      }
    }
  } catch (err) {
    return next(new ErrorResponse(err, 400));
  }
};
