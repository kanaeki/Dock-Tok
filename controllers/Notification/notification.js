const Notification = require("../..//models/Notification");
const ErrorResponse = require("../..//utils/errorResponse");

// @desc    Get Notifications
exports.getAll = async (req, res, next) => {
  try {
    const { filter = "", page = 1, limit = 10 } = req.query;
    let notifications, count;
    if (filter == "") {
      notifications = await Notification.find({ recipient: req.user._id })
        .sort({
          createdAt: -1,
        })
        .populate({
          path: "sender",
          select: "firstName lastName additionalInfo.profileImage",
        })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();
      count = await Notification.countDocuments({ recipient: req.user._id });
    } else {
      notifications = await Notification.find({
        recipient: req.user._id,
        readStatus: filter,
      })
        .populate({
          path: "sender",
          select: "firstName lastName additionalInfo.profileImage",
        })
        .sort({
          createdAt: -1,
        })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();
      count = await Notification.countDocuments({
        recipient: req.user._id,
        readStatus: filter,
      });
    }

    let countUnRead = await Notification.countDocuments({
      recipient: req.user._id,
      readStatus: false,
    });
    res.status(200).json({
      success: true,
      message: "List of Notifications",
      data: notifications,
      count: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      notificationCount: countUnRead,
    });
  } catch (err) {
    return next(new ErrorResponse(err, 400));
  }
};

// @desc    Mark as Read
exports.readNotification = async (req, res, next) => {
  try {
    const { notificationId } = req.body;
    const user = await Notification.findByIdAndUpdate(
      notificationId,
      {
        readStatus: true,
      },

      {
        new: true,
      },
    );
    let countUnRead = await Notification.countDocuments({
      recipient: req.user._id,
      readStatus: false,
    });
    res.status(200).json({
      success: true,
      message: "Notification successfully",
      data: user,
      notificationCount: countUnRead,
    });
  } catch (err) {
    return next(new ErrorResponse(err, 400));
  }
};
// @desc  All  Mark as Read
exports.readAllNotification = async (req, res, next) => {
  try {
    const notification = await Notification.updateMany(
      { recipient: req.user._id },
      {
        readStatus: true,
      },

      {
        new: true,
      },
    );
    let countUnRead = await Notification.countDocuments({
      recipient: req.user._id,
      readStatus: false,
    });
    res.status(200).json({
      success: true,
      message: "All notifications read successfully",
      data: notification,
      notificationCount: countUnRead,
    });
  } catch (err) {
    return next(new ErrorResponse(err, 400));
  }
};
