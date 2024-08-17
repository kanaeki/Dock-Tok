const Video = require("../../models/Video");
const ErrorResponse = require("../../utils/errorResponse");
const { s3Videov3, s3Uploadv3 } = require("../../utils/s3Bucket");
const fs = require("fs");
const path = require("path");
const ffprobePath = require("@ffprobe-installer/ffprobe").path;
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffmpeg = require("fluent-ffmpeg");
const { createNotification } = require("../../utils/notification");
const User = require("../../models/User");
const { MESSAGE } = require("../../Constant/message");
const { default: mongoose } = require("mongoose");
const generateThumbnail = require("../../utils/thumbnailGenerator");
const { formatDate } = require("../../utils/mixFunction");
const Winner = require("../../models/winner");
ffmpeg.setFfmpegPath(ffmpegPath); // @desc    Get Video
ffmpeg.setFfprobePath(ffprobePath);

// @desc    Get Video
exports.getAllVideo = async (req, res, next) => {
  try {
    let query = [];
    const {
      page = 1,
      limit = 10,
      filter = "active",
      dataId,
      search,
      status,
    } = req.query;
    query = [
      {
        $lookup: {
          from: "votes", // Name of the Vote collection
          localField: "_id",
          foreignField: "videoId",
          as: "votes",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "createdBy",
          foreignField: "_id",
          as: "createdBy",
        },
      },
      {
        $unwind: {
          path: "$votes",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: "$createdBy",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: "$_id",
          title: { $first: "$title" },
          description: { $first: "$description" },
          topicId: { $first: "$topicId" },
          tags: { $first: "$tags" },
          rules: { $first: "$rules" },
          videoDetail: { $first: "$videoDetail.video.Location" },
          thumbnail: { $first: "$videoDetail.thumbnail.path" },
          dataStatus: { $first: "$dataStatus" },
          createdBy: { $first: "$createdBy" },
          modifiedBy: { $first: "$modifiedBy" },
          createdAt: { $first: "$createdAt" },
          updatedAt: { $first: "$createdAt" },
          likeCount: {
            $sum: {
              $cond: [{ $eq: ["$votes.like", "LIKE"] }, 1, 0],
            },
          },
          dislikeCount: {
            $sum: {
              $cond: [{ $eq: ["$votes.like", "DISLIKE"] }, 1, 0],
            },
          },
          userLikes: {
            $push: {
              $cond: [
                { $eq: ["$votes.createdBy", req.user ? req.user._id : null] },
                "$votes.like",
                null,
              ],
            },
          },
        },
      },
      {
        $addFields: {
          isLiked: {
            $in: ["LIKE", "$userLikes"],
          },
        },
      },
      {
        $match: {
          videoDetail: { $exists: true, $ne: null },
          thumbnail: { $exists: true, $ne: null },
        },
      },
      {
        $project: {
          _id: 1,
          title: 1,
          description: 1,
          topicId: 1,
          tags: 1,
          rules: 1,
          videoDetail: 1,
          thumbnail: 1,
          dataStatus: 1,
          "createdBy._id": 1,
          "createdBy.firstName": 1,
          "createdBy.lastName": 1,
          "createdBy.additionalInfo.profileImage": 1,
          updatedAt: 1,
          likeCount: 1,
          dislikeCount: 1,
          isLiked: 1,
        },
      },
    ];
    if (req.user?.userRole == "subscriber") {
      filter = "active";
      // const match = {
      //   $match: {
      //     dataStatus: "ACTIVE",
      //   },
      // };
      // query.unshift(match);
    }
    switch (filter) {
      case "all":
        query.push({
          $sort: {
            likeCount: -1,
          },
        });
        break;
      case "updated_at":
        query.push({
          $sort: {
            updatedAt: -1,
          },
        });
        break;
      case "search":
        query.unshift({
          $match: {
            title: { $regex: `.*${search}.*`, $options: "i" },
            dataStatus: "ACTIVE",
          },
        });
        break;
      case "user":
        query.unshift({
          $match: {
            createdBy: new mongoose.Types.ObjectId(dataId),
            ...(status ? { dataStatus: status.toUpperCase() } : {}),
          },
        });
        break;
      case "topic":
        query.unshift({
          $match: {
            topicId: new mongoose.Types.ObjectId(dataId),
            ...(status ? { dataStatus: status.toUpperCase() } : {}),
          },
        });
        break;
      case "lastMonth": {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 0);
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        query.unshift({
          $match: {
            createdAt: {
              $gte: firstDay,
              $lte: lastDay,
            },
            dataStatus: "ACTIVE",
          },
        });
        query.push({
          $sort: {
            createdAt: -1,
          },
        });
        break;
      }
      case "threeMonth": {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        query.unshift({
          $match: {
            createdAt: {
              $gte: firstDay,
              $lte: lastDay,
            },
            dataStatus: "ACTIVE",
          },
        });
        query.push({
          $sort: {
            createdAt: -1,
          },
        });
        break;
      }
      case "lastYear": {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), 0, 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        query.unshift({
          $match: {
            createdAt: {
              $gte: firstDay,
              $lte: lastDay,
            },
            dataStatus: "ACTIVE",
          },
        });
        query.push({
          $sort: {
            createdAt: -1,
          },
        });
        break;
      }
      case "active":
        query.unshift({
          $match: {
            dataStatus: "ACTIVE",
          },
        });
        break;
      case "rejected":
        query.unshift({
          $match: {
            dataStatus: "REJECTED",
          },
        });
        break;
      case "myRejected":
        query.unshift({
          $match: {
            dataStatus: "REJECTED",
          },
        });
        break;
      case "myPending":
        query.unshift({
          $match: {
            dataStatus: "REJECTED",
          },
        });
        break;

      case "pending":
        query.unshift({
          $match: {
            dataStatus: "PENDING",
          },
        });
    }
    const video = Video.aggregate(query);
    count = await Video.aggregatePaginate(video, {
      page: parseInt(page),
      limit: parseInt(limit),
      countQuery: video,
    });
    console.log(count);
    res.status(200).json({
      success: true,
      message: MESSAGE.VIDEO_LIST,
      count: count.totalDocs,
      data: count.docs,
      totalPages: count.totalPages,
      currentPage: parseInt(page),
    });
  } catch (err) {
    return next(new ErrorResponse(err, 400));
  }
};
// @desc    Create Video
exports.createVideo = async (req, res, next) => {
  try {
    const videoPath = req.file.path;
    const videoKey = `${Date.now()}_${req.file.originalname}`;
    const { title, description, tags, topicId } = req.body;
    if (!title && !description) {
      return next(new ErrorResponse(MESSAGE.INVALID_DATA_REQUEST, 400));
    }
    if (!req.file) {
      return next(new ErrorResponse(MESSAGE.UPLOAD_ERROR, 400));
    }
    const video = await Video.create({
      title,
      description,
      tags: tags.split(","),
      topicId: topicId,
      createdBy: req.user._id,
      modifiedBy: req.user._id,
    });
    //NOTIFICATION
    let recipientUser = await User.findOne({ userRole: "admin" });
    await createNotification(
      "Video Uploaded", //title
      (message = `${req.user.firstName} ${MESSAGE.VIDEO_MESSGAE_NOTIFICATION}`), //message
      (recipient = recipientUser._id), //recipient id
      (fcmAndroidApp = recipientUser.fcmApp), //recipient fcm
      (data = { action: "Video Upload", id: video._id.toString() }), //Additional data
      (type = "VIDEO_POST"), //TYPE
      (sender = req.user._id), //sender
    );

    await res.status(200).json({
      success: true,
      message: MESSAGE.VIDEO_CREATE_SUCCESS,
      data: video,
    });

    const thumbnailPath = `${videoPath}.jpg`;
    // fs.renameSync(videoPath, localVideoPath);
    const thumbnailFilePath = await generateThumbnail(videoPath, thumbnailPath);
    // Save the video locally
    const localVideoPath = path.join(
      __dirname,
      "uploads",
      req.file.originalname,
    );
    const videoFilePath = fs.readFileSync(videoPath);
    const imageFilePath = fs.readFileSync(thumbnailFilePath);

    const videoFile = {
      path: videoPath,
      originalname: req.file.originalname,
      name: videoKey,
      buffer: videoFilePath,
    };
    const imageFile = {
      path: thumbnailFilePath,
      originalname: path.basename(thumbnailFilePath),
      name: path.parse(thumbnailFilePath).name,
      buffer: imageFilePath,
    };
    const videoResults = await s3Videov3(videoFile);
    const imageResults = await s3Uploadv3(imageFile);

    if (videoResults) {
      await Video.findByIdAndUpdate(video._id, {
        videoDetail: {
          video: videoResults.result,
          thumbnail: imageResults,
        },
      });
      fs.unlinkSync(thumbnailFilePath);
      fs.unlinkSync(videoPath);
      await createNotification(
        "Video Uploaded", //title
        (message = `${req.user.firstName} ${MESSAGE.VIDEO_MESSGAE_YOUR_VIDOE_READY}`), //message
        (recipient = req.user._id), //recipient id
        (fcmAndroidApp = req.user.fcmApp), //recipient fcm
        (data = { action: "Video Uploaded", id: video._id.toString() }), //Additional data
        (type = "VIDEO_POST"), //TYPE
        (sender = req.user._id), //sender
      );
    }
  } catch (err) {
    return next(new ErrorResponse(err, 400));
  }
};

// @desc    Edit User
exports.editVideo = async (req, res, next) => {
  try {
    // send Response
    const { title, description, tags } = req.body;
    if (!title && !description) {
      return next(new ErrorResponse(MESSAGE.INVALID_DATA_REQUEST, 400));
    }
    const video = await Video.findByIdAndUpdate(
      req.params.videoId,
      {
        title,
        description,
        tags,
        modifiedBy: req.user._id,
      },
      {
        new: true,
      },
    );
    res.status(202).json({
      success: true,
      message: MESSAGE.VIDEO_UPDATE_SUCCESS,
      data: video,
    });
  } catch (err) {
    return next(new ErrorResponse(err, 400));
  }
};
// @desc    Get VIDEO detail using videoId
exports.getVideo = async (req, res, next) => {
  try {
    let query = [
      {
        $match: {
          _id: new mongoose.Types.ObjectId(req.params.videoId),
        },
      },
      {
        $lookup: {
          from: "votes",
          localField: "_id",
          foreignField: "videoId",
          as: "votes",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "createdBy",
          foreignField: "_id",
          as: "createdBy",
        },
      },
      {
        $unwind: {
          path: "$votes",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: "$createdBy",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: "$_id",
          title: { $first: "$title" },
          description: { $first: "$description" },
          topicId: { $first: "$topicId" },
          tags: { $first: "$tags" },
          additionalInfo: { $first: "$additionalInfo" },
          dataStatus: { $first: "$dataStatus" },
          videoDetail: { $first: "$videoDetail.video.Key" },
          thumbnail: { $first: "$videoDetail.thumbnail.path" },
          likeCount: {
            $sum: {
              $cond: [{ $eq: ["$votes.like", "LIKE"] }, 1, 0],
            },
          },
          dislikeCount: {
            $sum: { $cond: [{ $eq: ["$votes.like", "DISLIKE"] }, 1, 0] },
          },
          userLikes: {
            $push: {
              $cond: [
                { $eq: ["$votes.createdBy", req.user ? req.user._id : null] },
                "$votes.like",
                null,
              ],
            },
          },
          createdBy: { $first: "$createdBy" },
          modifiedBy: { $first: "$modifiedBy" },
          createdAt: { $first: "$createdAt" },
          updatedAt: { $first: "$updatedAt" },
        },
      },
      {
        $addFields: {
          isLiked: {
            $in: ["LIKE", "$userLikes"],
          },
        },
      },
    ];
    if (
      req.user != undefined &&
      (req.user.userRole == "staff" || req.user.userRole == "admin")
    ) {
      query.splice(
        3,
        0,
        {
          $lookup: {
            from: "topics",
            localField: "topicId",
            foreignField: "_id",
            as: "topicId",
          },
        },
        {
          $unwind: {
            path: "$topicId",
            preserveNullAndEmptyArrays: true,
          },
        },
      );
      query.push({
        $project: {
          _id: 1,
          title: 1,
          description: 1,
          "topicId.rules": 1,
          additionalInfo: 1,
          tags: 1,
          rules: 1,
          videoDetail: 1,
          thumbnail: 1,
          "createdBy._id": 1,
          "createdBy.firstName": 1,
          "createdBy.lastName": 1,
          "createdBy.additionalInfo.profileImage": 1,
          "createdBy.createdAt": 1,
          "createdBy.email": 1,
          dataStatus: 1,
          updatedAt: 1,
          likeCount: 1,
          dislikeCount: 1,
          isLiked: 1,
        },
      });
    } else {
      query.push({
        $project: {
          _id: 1,
          title: 1,
          description: 1,
          topicId: 1,
          tags: 1,
          additionalInfo: 1,
          rules: 1,
          videoDetail: 1,
          thumbnail: 1,
          "createdBy._id": 1,
          "createdBy.firstName": 1,
          "createdBy.lastName": 1,
          "createdBy.additionalInfo.profileImage": 1,
          "createdBy.createdAt": 1,
          "createdBy.email": 1,
          dataStatus: 1,
          updatedAt: 1,
          likeCount: 1,
          dislikeCount: 1,
          isLiked: 1,
        },
      });
    }

    const video = await Video.aggregate(query);

    res
      .status(202)
      .json({ success: true, message: MESSAGE.VIDEO_DETAIL, data: video });
  } catch (err) {
    return next(new ErrorResponse(err, 400));
  }
};
// @desc    delete User
exports.deleteVideo = async (req, res, next) => {
  try {
    const checkVideo = await Winner.findOne({ videoId: req.params.videoId });
    if (!checkVideo) {
      const video = await Video.findOneAndDelete(
        { _id: req.params.videoId },
        {
          new: true,
        },
      );
      return res.status(200).json({
        success: true,
        message: MESSAGE.VIDEO_DELETE_SUCCESS,
        data: video,
      });
    } else {
      return res
        .status(400)
        .json({ success: false, message: MESSAGE.DELETE_FAIL });
    }
  } catch (err) {
    return next(new ErrorResponse(err, 400));
  }
};

// @desc Get Videos of a specific Challenge
exports.challengeVideo = async (req, res, next) => {
  try {
    const { page = 1, limit = 12 } = req.query;

    const video = await Video.find({ topicId: req.params.challengeId })
      .select({
        "videoDetail.thumbnail.path": 1,
        description: 1,
        topicId: 1,
        title: 1,
        tags: 1,
        dataStatus: 1,
        createdAt: 1,
      })
      .populate({
        path: "createdBy",
        select: "firstName lastName additionalInfo.profileImage",
      })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: 1 })
      .exec();
    if (video.length === 0) {
      return next(new ErrorResponse(MESSAGE.VIDEO_CHALLENGE_ERROR, 404));
    }
    return res.status(200).json({
      success: true,
      data: video,
    });
  } catch (err) {
    return next(new ErrorResponse(err, 400));
  }
};

//@desc get videos of a specific User
exports.getUserVideos = async (req, res, next) => {
  try {
    const { page = 1, limit = 5, filter = "all" } = req.query;

    let query = {
      createdBy: req.params.userId,
    };
    if (filter !== "all") {
      query["dataStatus"] = filter.toUpperCase();
    }
    const userVideos = await Video.find(query)
      .populate("createdBy")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: 1 })
      .exec();
    if (userVideos.length === 0) {
      return res.status(200).json({
        success: true,
        message: MESSAGE.NO_VIDEOS,
      });
    }
    const format = userVideos.map((item) => ({
      _id: item._id,
      title: item.title,
      description: item.description,
      tags: item.tags,
      dataStatus: item.dataStatus,
      videoDetail: item?.videoDetail?.video?.Location,
      thumbnail: item?.videoDetail?.thumbnail?.path,
      createdBy: {
        _id: item.createdBy._id,
        firstName: item.createdBy.firstName,
        lastName: item.createdBy.lastName,
        additionalInfo: {
          profileImage: item.createdBy?.additionalInfo?.profileImage,
        },
      },
      updatedAt: item.updatedAt,
    }));
    return res.status(200).json({
      success: true,
      message: MESSAGE.VIDEO_LIST,
      data: format,
    });
  } catch (err) {
    return next(new ErrorResponse(err, 400));
  }
};

//@desc get the most Liked
exports.getMostLikedVideo = async (req, res, next) => {
  try {
    const video = await Video.aggregate([
      {
        $match: {
          $expr: { $eq: ["$topicId", { $toObjectId: req.params.id }] },
        },
      },
      {
        $lookup: {
          from: "votes",
          localField: "_id",
          foreignField: "videoId",
          as: "likes",
        },
      },
      {
        $addFields: {
          likesCount: { $size: "$likes" },
        },
      },
      {
        $sort: {
          likesCount: -1,
        },
      },
      {
        $limit: 1,
      },
      {
        $lookup: {
          from: "users",
          localField: "createdBy",
          foreignField: "_id",
          as: "createdBy",
        },
      },
      {
        $unwind: {
          path: "$createdBy",
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $project: {
          _id: 1,
          title: 1,
          description: 1,
          topicId: 1,
          tags: 1,
          "videoDetail.video.Location": 1,
          "videoDetail.thumbnail.path": 1,
          "createdBy._id": 1,
          "createdBy.firstName": 1,
          "createdBy.lastName": 1,
          "createdBy.additionalInfo.profileImage": 1,
          likesCount: 1,
        },
      },
    ]);
    return res.status(200).json({
      success: true,
      message: MESSAGE.MOST_LIKED_VIDEO,
      data: video,
    });
  } catch (err) {
    return next(new ErrorResponse(err, 400));
  }
};
