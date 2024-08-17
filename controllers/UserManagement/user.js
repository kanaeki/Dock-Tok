const { MESSAGE } = require("../../Constant/message");
const User = require("../../models/User");
const ErrorResponse = require("../../utils/errorResponse");
const { s3Uploadv3 } = require("../../utils/s3Bucket");
const {
  startOfDay,
  endOfDay,
  parseISO,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
} = require("date-fns");

// @desc  get the User Profile
exports.getUserProfile = async (req, res, next) => {
  try {
    const userData = await User.findById(
      { _id: req.params.userId },
      {
        email: 1,
        firstName: 1,
        lastName: 1,
        createdAt: 1,
        dataStatus: 1,
        "additionalInfo.location": 1,
        "additionalInfo.profileImage": 1,
        "additionalInfo.phoneNumber": 1,
      },
    );

    res.status(200).json({
      success: true,
      message: MESSAGE.USER_DETAIL,
      data: userData,
    });
  } catch (err) {
    return next(new ErrorResponse(err, 400));
  }
};

exports.getDockies = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const usersWithVideoCountAndAwards = User.aggregate([
      {
        $lookup: {
          from: "videos", // The name of the videos collection
          localField: "_id", // The field from the User collection
          foreignField: "createdBy", // The field from the Video collection
          as: "videos", // The name of the output array
        },
      },
      {
        $lookup: {
          from: "winners", // The name of the awards collection
          localField: "_id", // The field from the User collection
          foreignField: "userId", // The field from the Award collection
          as: "winners", // The name of the output array
        },
      },
      {
        $project: {
          createdAt: 1,
          "additionalInfo.profileImage": 1,

          firstName: 1,
          lastName: 1,
          email: 1,
          userRole: 1,
          videoCount: { $size: "$videos" }, // Count the number of videos
          awardsCount: { $size: "$winners" }, // Count the number of awards
        },
      },
    ]);
    count = await User.aggregatePaginate(usersWithVideoCountAndAwards, {
      page: parseInt(page),
      limit: parseInt(limit),
      countQuery: usersWithVideoCountAndAwards,
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

// @desc Get all the Users
exports.getAllUsers = async (req, res, next) => {
  try {
    let count,
      query = {};
    const { page = 1, limit = 10, platform } = req.query;
    if (platform) {
      query[`socialConnect.${platform}`] = { $exists: true };
    }
    count = await User.countDocuments(query);
    const userData = await User.find(query, {
      username: 1,
      createdAt: 1,
      "additionalInfo.profileImage": 1,
      socialConnect: 1,
      firstName: 1,
      lastName: 1,
      email: 1,
      userRole: 1,
      dataStatus: 1,
    })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();
    res.status(200).json({
      success: true,
      data: userData,
      count: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
    });
  } catch (err) {
    return next(new ErrorResponse(err, 400));
  }
};

// @desc update the User Profile
exports.updateUserProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, gender, dateOfBirth, phoneNumber, location } =
      req.body;
    console.log(req.body);
    let user;
    user = await User.findByIdAndUpdate(
      req.params.userId,
      {
        firstName: firstName,
        lastName: lastName,
        "additionalInfo.gender": gender,
        "additionalInfo.phoneNumber": phoneNumber,
        "additionalInfo.location": location,
        "additionalInfo.dateOfBirth": dateOfBirth,
      },
      {
        new: true,
      },
    );
    // console.log(user);
    // if (dateOfBirth != undefined) {
    //   console.log("hree");
    //   user["additionalInfo.dateOfBirth"] = parseISO(dateOfBirth);
    // }
    if (req.file && req.file.size > 0) {
      const imageResult = await s3Uploadv3(req.file);
      user = await User.findByIdAndUpdate(
        req.params.userId,
        {
          "additionalInfo.profileImage": imageResult.path,
        },
        {
          new: true,
        },
      );
    }
    res.status(200).json({
      success: true,
      message: MESSAGE.USER_UPDATE_SUCCESS,
      data: user,
    });
  } catch (err) {
    return next(new ErrorResponse(err, 400));
  }
};

// @desc Disable the user from Login
exports.disableUser = async (req, res, next) => {
  try {
    const block = await User.findByIdAndUpdate(
      req.params.userId,
      {
        dataStatus: "block",
      },
      {
        new: true,
      },
    );
    return res.json({
      success: true,
      message: MESSAGE.USER_BLOCKED,
      data: block,
    });
  } catch (err) {
    return next(new ErrorResponse(err, 400));
  }
};

//@desc Enable the User Login
exports.enableUser = async (req, res, next) => {
  try {
    const unblock = await User.findByIdAndUpdate(
      req.params.userId,
      {
        dataStatus: "active",
      },
      {
        new: true,
      },
    );
    return res.json({
      success: true,
      message: MESSAGE.USER_ENABLED,
      data: unblock,
    });
  } catch (err) {
    return next(new ErrorResponse(err, 400));
  }
};

// @desc Block the User (USER)
exports.blockUser = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const user = await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { blockedUser: userId },
    });
    return res.json({
      success: true,
      message: MESSAGE.USER_BLOCKED,
    });
  } catch (err) {
    return next(new ErrorResponse(err, 400));
  }
};
// @desc USer Registration Graph
exports.userRegistrationGraph = async (req, res, next) => {
  try {
    const { type } = req.query;
    let startDate, endDate;
    let dataList = [];
    if (type === "week") {
      startDate = startOfWeek(new Date());
      endDate = endOfWeek(new Date());
    }
    if (type === "month") {
      startDate = startOfMonth(new Date());
      endDate = endOfMonth(new Date());
    }
    for (let day = startDate; day <= endDate; day.setDate(day.getDate() + 1)) {
      const startOfDayDate = startOfDay(new Date(day));
      const endOfDayDate = endOfDay(new Date(day));
      const userCount = await User.countDocuments({
        createdAt: {
          $gte: startOfDayDate,
          $lte: endOfDayDate,
        },
      });
      let data = {
        date: startOfDayDate,
        count: userCount,
      };
      dataList.push(data);
    }

    if (type === "year") {
      startDate = startOfYear(new Date());
      endDate = endOfYear(new Date());
      for (
        let month = startDate;
        month <= endDate;
        month.setMonth(month.getMonth() + 1)
      ) {
        const startOfMonthDate = startOfMonth(new Date(month));
        const endOfMonthDate = endOfMonth(new Date(month));
        const userCount = await User.countDocuments({
          createdAt: {
            $gte: startOfMonthDate,
            $lte: endOfMonthDate,
          },
        });
        let data = {
          date: startOfMonthDate,
          count: userCount,
        };
        dataList.push(data);
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        dataList,
      },
    });
  } catch (err) {
    return next(new ErrorResponse(err, 400));
  }
};

// @desc Showing the Users Traffic from social Handles
exports.userTrafficGraph = async (req, res, next) => {
  try {
    const allUser = await User.countDocuments();
    const fbUsers = await User.countDocuments({
      "socialConnect.facebook": { $exists: true },
    });
    const googleUsers = await User.countDocuments({
      "socialConnect.google": { $exists: true },
    });
    const instaUsers = await User.countDocuments({
      "socialConnect.instagram": { $exists: true },
    });
    const tiktokUsers = await User.countDocuments({
      "socialConnect.tiktok": { $exists: true },
    });
    const fb = (fbUsers / allUser) * 100;
    const google = (googleUsers / allUser) * 100;
    const insta = (instaUsers / allUser) * 100;
    const tiktok = (tiktokUsers / allUser) * 100;
    return res.status(200).json({
      success: true,
      data: {
        facebook: parseInt(fb),
        google: parseInt(google),
        instagram: parseInt(insta),
        tiktok: parseInt(tiktok),
      },
    });
  } catch (err) {
    return next(new ErrorResponse(err, 400));
  }
};

//@desc Store the FCM token
exports.storeFCMToken = async (req, res, next) => {
  try {
    const { fcmToken } = req.body;
    if (!fcmToken) {
      return next(new ErrorResponse(MESSAGE.FCM_STORE_ERROR, 400));
    }
    const user = await User.findByIdAndUpdate(req.user._id, {
      fcmApp: fcmToken,
    });

    return res.status(200).json({
      success: true,
      message: MESSAGE.FCM_STORE_SUCCESS,
    });
  } catch (err) {
    return next(new ErrorResponse(err, 400));
  }
};

//@desc update the array to string in fcmApp
exports.updateFcmApp = async (req, res, next) => {
  try {
    const updateResult = await User.updateMany({ fcmApp: { $type: "array" } }, [
      {
        $set: {
          fcmApp: {
            $arrayElemAt: ["$fcmApp", 0],
          },
        },
      },
    ]);
    return res.status(200).json({
      success: true,
      message: "Updated Successfully",
    });
  } catch (err) {
    return next(new ErrorResponse(err, 400));
  }
};

//@desc delete the User Login
exports.delUser = async (req, res, next) => {
  try {
    const unblock = await User.findOneAndDelete(
      { email: req.params.email },
      { new: true },
    );
    return res.json({
      success: true,
      message: MESSAGE.USER_ENABLED,
      data: unblock,
    });
  } catch (err) {
    return next(new ErrorResponse(err, 400));
  }
};
