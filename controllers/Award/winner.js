const ErrorResponse = require("../../utils/errorResponse.js");
const Award = require("../../models/winner.js");
const User = require("../../models/User.js");
const { createNotification } = require("../../utils/notification.js");
const Topic = require("../../models/Topic.js");
const Video = require("../../models/Video.js");
const { MESSAGE } = require("../../Constant/message.js");
const { winnerMail } = require("../../utils/sendEmail.js");
const Winner = require("../../models/winner.js");

// @decs create Winner
exports.createWinner = async (req, res, next) => {
  try {
    const { award, videoId, userId, awardType, tag, reason } = req.body;
    if (!award || !videoId || !awardType) {
      return next(new ErrorResponse(MESSAGE.INVALID_DATA_REQUEST, 400));
    }

    const newWinner = await Winner.create({
      award,
      videoId,
      tag,
      userId,
      awardType,
      reason,
      createdBy: req.user._id,
      modifiedBy: req.user._id,
    });
    //NOTIFICATION
    const fcm = await User.findOne(
      { _id: userId },
      { fcmApp: 1, firstName: 1, email: 1 },
    );
    const videoThumbnail = await Video.findOne({
      _id: videoId,
    }).select("videoDetail.thumbnail.path");
    await createNotification(
      (title = "Winner"), //title
      (message = `${fcm.firstName} ${MESSAGE.CHALLENGE_WINNER_NOTIFICATION}`), //message
      (recipient = userId), //recipient id
      (fcmAndroidApp = fcm.fcmApp), //recipient fcm
      (data = {
        action: "Winner",
        id: videoId,
        thumbnail: videoThumbnail.videoDetail.thumbnail.path,
      }), //Additional data
      (type = "WINNER"), //TYPE
      (sender = req.user._id), //sender
    );
    const video = await Video.findOne({ _id: videoId }, { topicId: 1 });
    const topic = await Topic.findOneAndUpdate(
      { _id: video.topicId },
      {
        winner: videoId,
      },
      { new: true },
    );
    res.status(201).json({
      success: true,
      message: MESSAGE.AWARD_CRAEATION_SUCCESS,
      data: newWinner,
    });
    //send Mail
    await winnerMail(fcm.email, fcm.firstName);
  } catch (err) {
    return next(new ErrorResponse(err, 400));
  }
};

// @decs get Award details of a specific User
exports.getuserWinner = async (req, res, next) => {
  try {
    const { page = 1, limit = 5 } = req.query;

    const userAward = await Winner.find(
      { userId: req.params.userId },
      { award: 1, awardType: 1 },
    )
      .populate({
        path: "videoId",
        select: "videoDetail.thumbnail.path title createdAt",
      })
      .populate({
        path: "awardType",
        select: "award awardType",
      })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: 1 })
      .exec();
    const awardCount = await Winner.countDocuments({ userId: req.user._id });
    if (!userAward) {
      return res.status(200).json({
        success: "true",
        message: MESSAGE.NOT_FOUND,
      });
    }
    return res.status(200).json({
      success: true,
      count: awardCount,
      data: userAward,
    });
  } catch (err) {
    return next(new ErrorResponse(err, 400));
  }
};

// @desc get all Winners
exports.getAllwinners = async (req, res, next) => {
  try {
    const { page = 1, limit = 18, filter = "All", search = "" } = req.query;
    let query = [
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userId",
        },
      },
      {
        $lookup: {
          from: "videos",
          localField: "videoId",
          foreignField: "_id",
          as: "videoId",
        },
      },
      {
        $unwind: {
          path: "$videoId",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: "$userId",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: "$_id",
          award: { $first: "$award" }, // Adding award to group
          awardType: { $first: "$awardType" }, // Adding awardType to group
          tag: { $first: "$tag" },
          videoId: { $first: "$videoId" },
          userId: { $first: "$userId" },
          createdBy: { $first: "$createdBy" },
          modifiedBy: { $first: "$modifiedBy" },
        },
      },
      {
        $project: {
          _id: 1,
          award: 1,
          awardType: 1,
          tag: 1,
          "videoId._id": 1,
          "videoId.title": 1,
          "videoId.tags": 1,
          "videoId.videoDetail.thumbnail.path": 1,
          "userId._id": 1,
          "userId.firstName": 1,
          "userId.lastName": 1,
          "userId.additionalInfo.profileImage": 1,
        },
      },
    ];

    if (filter !== "All") {
      query.unshift({
        $match: {
          tag: { $regex: new RegExp(filter, "i") },
        },
      });
    }
    if (search != "") {
      query.splice(5, 0, {
        $match: {
          "userId.firstName": { $regex: `.*${search}.*`, $options: "i" },
        },
      });
    }
    const allWinners = Winner.aggregate(query);
    count = await Winner.aggregatePaginate(allWinners, {
      page: parseInt(page),
      limit: parseInt(limit),
      countQuery: allWinners,
    });
    res.status(200).json({
      success: true,
      message: MESSAGE.AWARD_LIST,
      count: count.totalDocs,
      data: count.docs,
      totalPages: count.totalPages,
      currentPage: parseInt(page),
    });
  } catch (err) {
    return next(new ErrorResponse(err, 400));
  }
};

// @decs get Award details of a specific User
exports.getAwardByVideo = async (req, res, next) => {
  try {
    const userWinner = await Winner.findOne(
      {
        $and: [{ userId: req.params.userId }, { videoId: req.params.videoId }],
      },

      { award: 1, awardType: 1, tag: 1, createdAt: 1, reason: 1 },
    ).exec();
    const awardCount = await Award.countDocuments({
      $and: [{ userId: req.params.userId }, { videoId: req.params.videoId }],
    });
    if (!userWinner) {
      return res.status(404).json({
        success: "true",
        message: MESSAGE.NOT_FOUND,
      });
    }
    return res.status(200).json({
      success: true,
      data: userWinner,
    });
  } catch (err) {
    return next(new ErrorResponse(err, 400));
  }
};

exports.deleteWinner = async (req, res, next) => {
  try {
    const winner = await Winner.findByIdAndDelete(req.params.id, {
      new: true,
    });
    if (!winner) {
      return res.status(404).json({
        success: false,
        message: MESSAGE.NOT_FOUND,
      });
    }
    return res.status(200).json({
      success: true,
      message: MESSAGE.DELETED,
      data: winner,
    });
  } catch (err) {
    return next(new ErrorResponse(err, 400));
  }
};

exports.getWinnerVideoCount = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, filter = "lastMonth" } = req.query;
    let query = [
      {
        $lookup: {
          from: "videos",
          localField: "videoId",
          foreignField: "_id",
          as: "videoId",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userId",
        },
      },
      {
        $unwind: "$videoId",
      },
      {
        $unwind: "$userId",
      },
      {
        $group: {
          _id: "$userId._id",
          firstName: {
            $first: "$userId.firstName",
          },
          lastName: {
            $first: "$userId.lastName",
          },
          profileImage: {
            $first: "$userId.additionalInfo.profileImage",
          },
          awardCount: {
            $sum: {
              $cond: [{ $eq: ["$videoId.createdBy", "$userId._id"] }, 1, 0],
            },
          },
        },
      },
      {
        $project: {
          _id: 1,
          firstName: 1,
          lastName: 1,
          profileImage: 1,
          awardCount: 1,
        },
      },
    ];
    switch (filter) {
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
          },
        });
        query.push({
          $sort: {
            createdAt: -1,
          },
        });
        break;
      }
      default: {
        query.push({
          $sort: {
            createdAt: -1,
          },
        });
        break;
      }
    }
    const winners = Winner.aggregate(query);
    count = await Winner.aggregatePaginate(winners, {
      page: parseInt(page),
      limit: parseInt(limit),
      countQuery: winners,
    });
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
