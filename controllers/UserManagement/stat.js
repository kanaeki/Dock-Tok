const { MESSAGE } = require("../../Constant/message");
const User = require("../../models/User");
const Video = require("../../models/Video");
const Winner = require("../../models/winner");
const ErrorResponse = require("../../utils/errorResponse");

// @desc Showing user's Stat of a user
exports.userStat = async (req, res, next) => {
  try {
    const videoCount = await Video.countDocuments({
      createdBy: req.params.userId,
    });
    const awardCount = await Winner.countDocuments({
      userId: req.params.userId,
    });
    res.status(200).json({
      success: true,
      videoCount: videoCount,
      awardCount: awardCount,
    });
  } catch (err) {
    return next(new ErrorResponse(err, 400));
  }
};

//@desc Get stats of all the Users
exports.allUserStats = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const result = User.aggregate([
      {
        $match: {
          userRole: { $regex: new RegExp("subscriber", "i") },
        },
      },
      {
        $lookup: {
          from: "videos",
          localField: "_id",
          foreignField: "createdBy",
          as: "Videos",
        },
      },
      {
        $lookup: {
          from: "winners",
          localField: "_id",
          foreignField: "userId",
          as: "winners",
        },
      },
      {
        $addFields: {
          videoCount: { $size: "$Videos" },
          awardCount: { $size: "$winners" },
        },
      },
      {
        $project: {
          _id: 1,
          firstName: 1,
          lastName: 1,
          "additionalInfo.profileImage": 1,
          videoCount: 1,
          awardCount: 1,
        },
      },
    ]);
    count = await User.aggregatePaginate(result, {
      page: parseInt(page),
      limit: parseInt(limit),
      countQuery: result,
    });

    res.status(200).json({
      success: true,
      message: MESSAGE.USER_DETAIL,
      data: count.docs,
      count: count.totalDocs,
      totalPages: count.totalPages,
      currentPage: parseInt(page),
    });
  } catch (err) {
    return next(new ErrorResponse(err, 400));
  }
};

exports.adminCards = async (req, res, next) => {
  try {
    const inital = {
      ACTIVE: 0,
      PENDING: 0,
      REJECTED: 0,
    };
    const video = await Video.aggregate([
      {
        $match: {
          dataStatus: {
            $in: ["ACTIVE", "PENDING", "REJECTED"],
          },
        },
      },
      {
        $group: {
          _id: "$dataStatus",
          count: {
            $sum: 1,
          },
        },
      },
    ]);
    const result = video.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, inital);

    res.status(200).json({
      success: true,
      message: MESSAGE.ADMIN_CARD,
      data: result,
    });
  } catch (err) {
    return next(new ErrorResponse(err, 400));
  }
};
