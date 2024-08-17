const { MESSAGE } = require("../../../Constant/message");
const VideoFlag = require("../../../models/VideoFlag");
const ErrorResponse = require("../../../utils/errorResponse");

// @desc flag Video
exports.createFlag = async (req, res, next) => {
  try {
    const { message, type, videoId } = req.body;
    if (!message && !videoId) {
      return next(new ErrorResponse(MESSAGE.INVALID_DATA_REQUEST, 400));
    }
    const flag = await VideoFlag.create({
      message: message,
      type: type,
      videoId: videoId,
      createdBy: req.user._id,
      modifiedBy: req.user._id,
    });
    return res.status(200).json({
      success: true,
      message: MESSAGE.FLAG_VIDEO_CREATE_SUCCESS,
      data: flag,
    });
  } catch (err) {
    return next(new ErrorResponse(err, 400));
  }
};

// @desc get list of reported Videos
exports.getAllFlagVideos = async (req, res, next) => {
  try {
    let count;
    const { page = 1, limit = 10 } = req.query;
    count = await VideoFlag.countDocuments();
    const allVideos = await VideoFlag.find()
      .populate("videoId")
      .populate({
        path: "videoId",
        match: { dataStatus: "ACTIVE" },
        select:
          "title description videoDetail.video.Location videoDetail.thumbnail.path",
      })
      .populate({
        path: "createdBy",
        select: "firstName email",
      })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
    if (!allVideos || allVideos.length === 0) {
      return next(new ErrorResponse(MESSAGE.FLAG_VIDEO_NOT_FOUND, 404));
    }
    return res.status(200).json({
      success: true,
      message: MESSAGE.FLAG_VIDEO_LIST,
      data: allVideos,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
    });
  } catch (err) {
    return next(new ErrorResponse(err, 400));
  }
};
// @desc get   reported video on the basis of videoId
exports.getFlagVideo = async (req, res, next) => {
  try {
    const { videoId } = req.params;
    const flagVideo = await VideoFlag.find({
      videoId: videoId,
    }).populate({
      path: "videoId",
      match: { dataStatus: "ACTIVE" },
      select:
        "title description videoDetail.video.Location videoDetail.thumbnail.path ",
    });
    if (!flagVideo || flagVideo.length === 0) {
      return next(new ErrorResponse(MESSAGE.FLAG_VIDEO_NOT_FOUND, 404));
    }
    return res.status(200).json({
      success: true,
      message: MESSAGE.FLAG_VIDEO_FOUND,
      data: flagVideo,
    });
  } catch (err) {
    return next(new ErrorResponse(err, 400));
  }
};
