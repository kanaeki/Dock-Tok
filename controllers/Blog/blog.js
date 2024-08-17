const ErrorResponse = require("../../utils/errorResponse");
const { MESSAGE } = require("../../Constant/message.js");
const fs = require("fs");
const path = require("path");
const { Blog } = require("../../models/blog.js");
const {
  s3Videov3,
  s3Uploadv3,
  s3Deletev3,
} = require("../../utils/s3Bucket.js");
const saveVersion = require("./blogHistory.js");
const { Category } = require("../../models/category.js");
const generateThumbnail = require("../../utils/thumbnailGenerator.js");
const { findFileType } = require("../../utils/findFileType");
const Mail = require("../../models/mail.js");
const User = require("../../models/User.js");
const { agenda } = require("../../utils/queue.js");
// @desc Create Blog
exports.createBlog = async (req, res, next) => {
  try {
    let userIds = [];
    let fcmTokens = [];
    const mediaType = findFileType(req.file);
    const mediaPath = req.file.path;
    const filekey = `${Date.now()}_${req.file.originalname}`;
    const { title, content, featured } = req.body;
    let category = req.body.category;
    if (!title && !content) {
      return next(new ErrorResponse(MESSAGE.INVALID_DATA_REQUEST, 400));
    }
    if (mediaType != "video") {
      return next(new ErrorResponse(MESSAGE.INVALID_FILE_FORMAT, 400));
    }

    if (category === "" || category == undefined) {
      const uncategory = await Category.findOne({
        name: "Uncategorized",
      });
      category = uncategory._id;
    }
    const blog = await Blog.create({
      title: title,
      content: content,
      featured: featured,
      category: category,
      createdBy: req.user._id,
      modifiedBy: req.user._id,
    });

    res.status(200).json({
      success: true,
      message: MESSAGE.BLOG_CREATE_SUCCESS,
      data: blog,
    });
    //sendmail
    const userMails = await Mail.find().populate("createdBy");

    userMails &&
      (await agenda.schedule("in 10 seconds", "sendMail", {
        mails: JSON.stringify(userMails),
      }));
    // NOTIFICATION /////////////////////////////////////////////
    const allUser = await User.find(
      { userRole: "subscriber" },
      { _id: 1, fcmApp: 1 },
    );
    allUser.forEach((user) => {
      userIds.push(user._id);
      fcmTokens.push(user.fcmApp);
    });

    await agenda.schedule("in 1 seconds", "sendNotification", {
      title: "New Blog",
      message: MESSAGE.BLOG_NOTIFICATION,
      type: "Blog Creation",
      id: blog._id.toString(),
      fcmTokens: fcmTokens,
    });

    await agenda.schedule("in 5 seconds", "saveJob", {
      userIds: userIds,
      title: "New Blog",
      message: MESSAGE.BLOG_NOTIFICATION,
      senderId: req.user._id,
      id: blog._id.toString(),
      action: "Blog Creation",
      type: "BLOG",
    });
    (async function () {
      await agenda.start();
    })();

    //////////////////////////////////////////
    if (mediaType === "image") {
      const imageFilePath = fs.readFileSync(mediaPath);
      const imageFile = {
        path: mediaPath,
        originalname: req.file.originalname,
        name: filekey,
        buffer: imageFilePath,
      };

      const imageResults = await s3Uploadv3(imageFile);
      if (imageResults) {
        await Blog.findByIdAndUpdate(blog._id, {
          mediaType,
          videoDetail: {
            thumbnail: imageResults,
          },
        });
      }

      // Clean up local file
      fs.unlinkSync(mediaPath);
    }
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
        await Blog.findByIdAndUpdate(blog._id, {
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
  } catch (err) {
    return next(new ErrorResponse(err, 400));
  }
};

//@desc getBlogs
exports.getAllBlogs = async (req, res, next) => {
  try {
    let count;
    const { filter, page = 1, limit = 10, search = "" } = req.query;
    let allBlogs;
    let query = {};
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
    if (search !== "") {
      query = {
        ...query,
        title: { $regex: `.*${search}.*`, $options: "i" },
      };
    }
    count = await Blog.countDocuments(query);
    allBlogs = await Blog.find(query)
      .populate("category", "_id name")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 })
      .exec();
    return res.status(200).json({
      success: true,
      message: MESSAGE.BLOG_LIST,
      data: allBlogs,
      count: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
    });
  } catch (err) {
    return next(new ErrorResponse(err, 400));
  }
};
//@desc getBlogs
exports.getBlog = async (req, res, next) => {
  try {
    const getBlog = await Blog.findById(req.params.blogId);
    if (!getBlog) {
      return next(new ErrorResponse(MESSAGE.BLOG_NOT_FOUND, 404));
    }
    return res.status(200).json({
      success: true,
      message: MESSAGE.BLOG_DETAIL,
      data: getBlog,
    });
  } catch (err) {
    return next(new ErrorResponse(err, 400));
  }
};

//@desc delete a Blog
exports.deleteBlog = async (req, res, next) => {
  try {
    const getBlog = await Blog.findById(req.params.blogId);

    if (!getBlog) {
      return next(new ErrorResponse(MESSAGE.BLOG_NOT_FOUND, 400));
    }
    if (getBlog?.videoDetail?.thumbnail?.path) {
      const image = await s3Deletev3(getBlog.videoDetail.thumbnail.path);
    }
    if (getBlog?.videoDetail?.video?.Location) {
      const video = await s3Deletev3(getBlog.videoDetail.video.Key);
    }
    const blog = await Blog.findOneAndDelete(
      { _id: req.params.blogId },
      {
        new: true,
      },
    );
    if (!blog) {
      return next(new ErrorResponse(MESSAGE.INVALID_DATA_REQUEST, 400));
    }
    res
      .status(200)
      .json({ success: true, message: MESSAGE.BLOG_DELETE_SUCCESS });
  } catch (err) {
    return next(new ErrorResponse(err, 400));
  }
};

//@desc update a Blog
exports.updateBlog = async (req, res, next) => {
  try {
    const mediaType = (req.file && findFileType(req.file)) || null;

    const blogId = req.params.blogId;
    const { title, content, category, featured } = req.body;
    if (!title && !content) {
      return next(new ErrorResponse(MESSAGE.INVALID_DATA_REQUEST, 400));
    }

    const getblog = await Blog.findById(blogId);
    if (!getblog) {
      return next(new ErrorResponse(MESSAGE.BLOG_NOT_FOUND, 400));
    }

    await saveVersion.saveBlogVersion(getblog);
    const blog = await Blog.findByIdAndUpdate(
      blogId,
      {
        title: title,
        content: content,
        category: category,
        modifiedBy: req.user._id,
        featured: featured,
      },
      {
        new: true,
      },
    ).select("-videoDetail -__v");

    res.status(202).json({
      success: true,
      message: MESSAGE.BLOG_UPDATE_SUCCESS,
      data: blog,
    });

    if (req.file && req.file.size > 0) {
      const mediaPath = req.file.path;
      const filekey = `${Date.now()}_${req.file.originalname}`;
      if (mediaType === "image") {
        const imageFilePath = fs.readFileSync(mediaPath);
        const imageFile = {
          path: mediaPath,
          originalname: req.file.originalname,
          name: filekey,
          buffer: imageFilePath,
        };

        const imageResults = await s3Uploadv3(imageFile);
        if (imageResults) {
          await Blog.findByIdAndUpdate(blog._id, {
            videoDetail: {
              thumbnail: imageResults,
            },
          });
        }

        // Clean up local file
        fs.unlinkSync(mediaPath);
      }
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
          await Blog.findByIdAndUpdate(blog._id, {
            videoDetail: {
              video: videoResults.result,
              thumbnail: imageResults,
            },
          });
          fs.unlinkSync(thumbnailFilePath);
          fs.unlinkSync(mediaPath);
        }
      }
    }
  } catch (err) {
    return next(new ErrorResponse(err, 400));
  }
};
