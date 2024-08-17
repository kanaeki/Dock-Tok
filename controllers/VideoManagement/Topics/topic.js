const Topic = require("../../../models/Topic");
const ErrorResponse = require("../../../utils/errorResponse");
const User = require("../../../models/User");
const {
  s3Videov3,
  s3Uploadv3,
  s3Deletev3,
} = require("../../../utils/s3Bucket");
const { sendNotificationToAll } = require("../../../utils/notification");
const Notification = require("../../../models/Notification");
const { MESSAGE } = require("../../../Constant/message");
const { startOfDay, endOfDay, parseISO } = require("date-fns");
const { findFileType } = require("../../../utils/findFileType");
const fs = require("fs");
const path = require("path");
const generateThumbnail = require("../../../utils/thumbnailGenerator");
const { agenda } = require("../../../utils/queue");
// @desc    Get Topic
exports.getAllTopic = async (req, res, next) => {
  try {
    let topic, count, parsedStartDate, parsedEndDate;
    const {
      page = 1,
      limit = 10,
      search = "",
      // featured = false,
      // event = false,
      winner,
      // startDate,
      // endDate,
      status,
      filter = "",
    } = req.query;

    let query = {};

    // typeof req.query.filter != "undefined"
    //   ? // && typeof req.query.event != "undefined"
    //     {
    //       // featured: filter == "featured" ? true : false,
    //       // event: event === "true" ? true : false,
    //       dataStatus: status == "false" ? "ARCHIVE" : "ACTIVE",
    //     }
    //   : {};
    switch (filter) {
      case "lastMonth": {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        query = {
          createdAt: {
            $gte: firstDay,
            $lte: lastDay,
          },
        };
        break;
      }
      case "threeMonth": {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        query = {
          createdAt: {
            $gte: firstDay,
            $lte: lastDay,
          },
        };
        break;
      }
      case "lastYear": {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), 0, 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        query = {
          createdAt: {
            $gte: firstDay,
            $lte: lastDay,
          },
        };
        break;
      }
      case "featured": {
        query = {
          featured: true,
        };
        break;
      }
      default: {
        query = {};
        break;
      }
    }
    if (search != "") {
      query.title = { $regex: `.*${search}.*`, $options: "i" };
    }
    // if (startDate && endDate) {
    //   const parsedStartDate = startOfDay(parseISO(startDate));
    //   const parsedEndDate = endOfDay(parseISO(endDate));
    //   query.createdAt = {
    //     $gte: parsedStartDate,
    //     $lte: parsedEndDate,
    //   };
    //   //
    // }

    // IF WINNER TRUE
    if (winner === "true") {
      topic = await Topic.find(query)
        .select("-thumbnail.result ")
        .populate({
          path: "winner",
          select: "-videoDetail.video -videoDetail.thumbnail.result",
        })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();
      count = await Topic.countDocuments(query);
    } else {
      topic = await Topic.find(query)
        .select("-thumbnail.result")
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();
      count = await Topic.countDocuments(query);
    }

    res.status(200).json({
      success: true,
      message: MESSAGE.TOPIC_LIST,
      data: topic,
      count: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
    });
  } catch (err) {
    return next(new ErrorResponse(err, 400));
  }
};

// @desc    Create Topic
exports.createTopic = async (req, res, next) => {
  try {
    let userIds = [];
    let fcmTokens = [];
    // send Response
    const mediaType = findFileType(req.file);
    const mediaPath = req.file.path;
    const filekey = `${Date.now()}_${req.file.originalname}`;

    const { title, description, rules, featured } = req.body;
    if (!title && !description) {
      return next(new ErrorResponse(MESSAGE.INVALID_DATA_REQUEST, 400));
    }
    if (!req.file) {
      return res.status(400).send(MESSAGE.UPLOAD_ERROR);
    }
    let topic = await Topic.create({
      title,
      description,
      rules,
      featured,
      createdBy: req.user._id,
      modifiedBy: req.user._id,
    });
    featured == "true" &&
      (await Topic.updateMany(
        { _id: { $ne: topic._id } },
        { $set: { featured: false } },
      ));
    res.status(200).json({
      success: true,
      message: MESSAGE.TOPIC_CREATION_SUCCESS,
      data: topic,
    });

    if (mediaType === "video") {
      const thumbnailPath = `${mediaPath}.jpg`;
      const thumbnailFilePath = await generateThumbnail(
        mediaPath,
        thumbnailPath,
      );
      const videoFilePath = fs.readFileSync(mediaPath);
      const imageFilePath = fs.readFileSync(thumbnailFilePath);

      const videoFile = {
        path: mediaPath,
        originalname: req.file.originalname,
        name: filekey,
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
        await Topic.findByIdAndUpdate(topic._id, {
          mediaType,
          videoDetail: {
            video: videoResults.result,
            thumbnail: imageResults,
          },
        });
        fs.unlinkSync(thumbnailFilePath);
        fs.unlinkSync(mediaPath);
      }
    }
    //NOTIFICATION
    const allUser = await User.find(
      { userRole: "subscriber" },
      { _id: 1, fcmApp: 1 },
    );

    allUser.forEach((user) => {
      userIds.push(user._id);
      fcmTokens.push(user.fcmApp);
    });
    if (topic.featured === true) {
      await agenda.schedule("in 1 seconds", "sendNotification", {
        title: "New Header Video",
        message: MESSAGE.TOPIC_MESSAGE_NOTIFICATION,
        type: "TOPIC CREATION",
        id: topic._id.toString(),
        fcmTokens: fcmTokens,
      });
      // await sendNotificationToAll({
      //   title: "New Header Video", //title
      //   body: MESSAGE.TOPIC_MESSAGE_NOTIFICATION, //message
      //   data: {
      //     action: "TOPIC CREATION",
      //     Id: topic._id.toString(),
      //   },
      //   tokens: fcmTokens, //recipient fcm
      // });
      await agenda.schedule("in 5 seconds", "saveJob", {
        userIds: userIds,
        senderId: req.user._id,
        id: topic._id.toString(),
        title: "New Topic",
        message: MESSAGE.TOPIC_MESSAGE_NOTIFICATION,
        type: "TOPIC",
        action: "TOPIC CREATION",
      });
      (async function () {
        await agenda.start();
      })();
      for (let i = 0; i < userIds.length; i++) {
        await Notification.create({
          title: "New Topic",
          message: MESSAGE.TOPIC_MESSAGE_NOTIFICATION,
          recipient: userIds[i],
          sender: req.user._id,
          data: { action: "TOPIC CREATION", id: topic._id },
          type: "TOPIC",
        });
      }
    }
  } catch (err) {
    return next(new ErrorResponse(err, 400));
  }
};
// @desc    Edit User
exports.editTopic = async (req, res, next) => {
  try {
    // send Response
    const { title, description, rules, featured, event } = req.body;
    if (!title && !description) {
      return next(new ErrorResponse(MESSAGE.INVALID_DATA_REQUEST, 400));
    }
    const gettopic = await Topic.findById(req.params.topicId);
    if (!gettopic) {
      return next(new ErrorResponse(MESSAGE.TOPIC_NOT_FOUND, 404));
    }
    const topic = await Topic.findByIdAndUpdate(
      req.params.topicId,
      {
        title,
        description,
        rules,
        featured,
        event,
        modifiedBy: req.user._id,
      },
      {
        new: true,
      },
    );
    res.status(202).json({
      success: true,
      message: MESSAGE.TOPIC_UPDATE_SUCCESS,
      data: topic,
    });
    if (req.file && req.file.size > 0) {
      const thumbnail = await s3Uploadv3(req.file);
      await s3Deletev3(topic.thumbnail.path);
      await Topic.findByIdAndUpdate(req.params.topicId, {
        thumbnail: thumbnail,
      });
    }
  } catch (err) {
    return next(new ErrorResponse(err, 400));
  }
};
// @desc    Get TOPIC on the basis of ID
exports.getTopic = async (req, res, next) => {
  try {
    const topic = await Topic.findById(req.params.topicId);
    res
      .status(202)
      .json({ success: true, message: MESSAGE.TOPIC_DETAIL, data: topic });
  } catch (err) {
    return next(new ErrorResponse(err, 400));
  }
};
// @desc    delete Topic
exports.deleteTopic = async (req, res, next) => {
  try {
    const getTopic = await Topic.findById(req.params.topicId);
    if (getTopic?.videoDetail?.thumbnail?.path) {
      const image = await s3Deletev3(getTopic.videoDetail.thumbnail.path);
    }
    if (getTopic?.videoDetail?.video?.Location) {
      const video = await s3Deletev3(getTopic.videoDetail.video.Key);
    }
    const topic = await Topic.findOneAndDelete(
      { _id: req.params.topicId },
      {
        new: true,
      },
    );
    if (!topic) {
      return next(new ErrorResponse(MESSAGE.INVALID_DATA_REQUEST, 400));
    }
    res.status(200).json({ success: true, data: topic });
  } catch (err) {
    return next(new ErrorResponse(err, 400));
  }
};
// @desc Archive the Topic
exports.archiveTopic = async (req, res, next) => {
  try {
    const topicId = req.params.topicId;
    const topic = await Topic.findByIdAndUpdate(
      topicId,
      {
        dataStatus: "ARCHIVE",
      },
      {
        new: true,
      },
    );
    return res.status(200).json({
      success: true,
      message: MESSAGE.TOPIC_ARCHIVE,
      data: topic,
    });
  } catch (err) {
    return next(new ErrorResponse(err, 400));
  }
};
// @desc Get the stats of the Events
exports.getEventStats = async (req, res, next) => {
  try {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const totalEvents = await Topic.countDocuments({});
    const monthEvents = await Topic.countDocuments({
      createdAt: {
        $gte: firstDay,
        $lte: lastDay,
      },
    });
    const pendingWinners = await Topic.countDocuments({
      winner: null,
    });
    return res.status(200).json({
      success: true,
      totalEvents: totalEvents,
      PendingWinnerEvents: pendingWinners,
      monthEvents: monthEvents,
    });
  } catch (err) {
    return next(new ErrorResponse(err, 400));
  }
};
