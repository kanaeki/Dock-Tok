const { model } = require("mongoose");
const { MESSAGE } = require("../../Constant/message");
const { Blog } = require("../../models/blog");
const User = require("../../models/User");
const Video = require("../../models/Video");
const ErrorResponse = require("../../utils/errorResponse");

exports.search = async (req, res, next) => {
  try {
    const { filter = "video", search } = req.query;
    let query = [];
    switch (filter) {
      case "blog":
        modelName = Blog;
        query = [
          {
            $match: {
              title: { $regex: `.*${search}.*`, $options: "i" },
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
            $unwind: "$createdBy",
          },
          {
            $project: {
              _id: 1,
              title: 1,
              content: 1,
              category: 1,
              featured: 1,
              videoDetail: "$videoDetail.video.Location",
              thumbnail: "$videoDetail.thumbnail.path",
              "createdBy._id": 1,
              "createdBy.firstName": 1,
              "createdBy.lastName": 1,
              "createdBy.additionalInfo.profileImage": 1,
              createdAt: 1,
              updatedAt: 1,
            },
          },
        ];
        break;
      case "user":
        modelName = User;
        query = [
          {
            $match: {
              firstName: { $regex: `.*${search}.*`, $options: "i" },
            },
          },
          {
            $project: {
              _id: 1,
              firstName: 1,
              lastName: 1,
              additionalInfo: {
                profileImage: "$additionalInfo.profileImage",
              },
            },
          },
        ];
        break;
      case "video":
        modelName = Video;
        query = [
          {
            $match: {
              title: {
                $regex: `.*${search}.*`,
                $options: "i",
              },
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
            $lookup: {
              from: "votes",
              localField: "_id",
              foreignField: "videoId",
              as: "votes",
            },
          },
          {
            $unwind: {
              path: "$createdBy",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $unwind: {
              path: "$votes",
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
                    {
                      $eq: ["$votes.createdBy", req.user ? req.user._id : null],
                    },
                    "$votes.like",
                    null,
                  ],
                },
              },
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

        break;
    }

    const result = await modelName.aggregate(query);

    return res.status(200).json({
      success: true,
      message: MESSAGE.SEARCH_RESULT,
      data: result,
    });
  } catch (err) {
    return next(new ErrorResponse(err, 400));
  }
};
