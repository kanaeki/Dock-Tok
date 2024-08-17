const { MESSAGE } = require("../../Constant/message.js");
const Comment = require("../../models/Comment.js");
const Video = require("../../models/Video.js");
const ErrorResponse = require("../../utils/errorResponse");
const { createNotification } = require("../../utils/notification.js");

//@desc create Comment
exports.createComment = async (req, res, next) => {
  try {
    const { content, videoId, reply } = req.body;

    if (!content || !videoId) {
      return next(new ErrorResponse(MESSAGE.INVALID_DATA_REQUEST, 400));
    }

    let replyComment = null;
    if (reply) {
      replyComment = await Comment.findById(reply);
      if (!replyComment) {
        return next(new ErrorResponse(MESSAGE.INVALID_REPLY_ID, 400));
      }
    }

    // Create a new comment
    const comment = await Comment.create({
      content: content,
      videoId: videoId,
      createdBy: req.user._id,
      modifiedBy: req.user._id,
    });

    if (replyComment) {
      await Comment.findByIdAndUpdate(reply, {
        $push: { reply: comment._id },
      });
    }
    const recipientUser = await Video.findOne({ _id: videoId }).populate({
      path: "createdBy",
      model: "User",
      select: { _id: 1, fcmApp: 1 },
    });
    // notification
    //

    const video = await Video.findOne({
      _id: videoId,
    }).select("videoDetail.thumbnail.path");
    {
      await createNotification(
        (title = "New Comment"), //title
        (message = `${req.user.firstName} ${MESSAGE.COMMENT_MESSAGE_NOTIFICATION}`), //message
        (recipient = recipientUser.createdBy._id), //recipient id
        (fcmAndroidApp = recipientUser.createdBy.fcmApp), //recipient fcm
        (data = {
          action: "COMMENT",
          id: videoId,
          thumbnail: video.videoDetail.thumbnail.path,
        }), //Additional data
        (type = "COMMENT"), //TYPE
        (sender = req.user._id), //sender
      );
    }
    //
    return res.status(201).json({
      success: true,
      message: MESSAGE.COMMENT_CREATE_SUCCESS,
      data: comment,
    });
  } catch (err) {
    return next(new ErrorResponse(err, 400));
  }
};

//@desc get Comments of a specific Video
exports.getComment = async (req, res, next) => {
  try {
    let count;
    const { page = 1, limit = 5 } = req.query;
    count = await Comment.countDocuments({
      videoId: req.params.id,
    });
    const allComments = await Comment.find({
      videoId: req.params.id,
    })
      .populate("createdBy", "firstName lastName additionalInfo.profileImage")
      .limit(limit * 1)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .exec();

    return res.status(200).json({
      success: true,
      message: MESSAGE.COMMENT_LIST,
      data: allComments,
      count: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
    });
  } catch (err) {
    return next(new ErrorResponse(err, 400));
  }
};

// @desc update Comment
exports.updateComment = async (req, res, next) => {
  try {
    const commentId = req.params.commentId;
    const { content } = req.body;

    if (!content) {
      return next(new ErrorResponse(MESSAGE.INVALID_DATA_REQUEST, 400));
    }
    const comment = await Comment.findByIdAndUpdate(
      commentId,
      {
        content: content,
        modifiedBy: req.user._id,
      },
      { new: true },
    );

    return res.json({
      success: true,
      message: MESSAGE.COMMENT_UPDATE_SUCCESS,
      data: comment,
    });
  } catch (err) {
    return next(new ErrorResponse(err, 400));
  }
};

// @desc delete Comment
exports.deleteComment = async (req, res, next) => {
  try {
    const commentId = req.params.commentId;
    const delComment = await Comment.findOneAndDelete({ _id: commentId });
    return res.status(200).json({
      success: true,
      message: MESSAGE.COMMENT_DELETE_SUCCESS,
    });
  } catch (err) {
    return next(new ErrorResponse(err, 400));
  }
};
