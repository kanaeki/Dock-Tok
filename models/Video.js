const mongoose = require("mongoose");
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");

const VideoSchema = new mongoose.Schema(
  {
    title: { type: String },
    description: { type: String },
    topicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Topic",
      required: true,
    },
    tags: [{ type: String }],
    videoDetail: { type: Object },
    thumbnail: { type: String },
    dataStatus: {
      type: String,
      enum: ["ACTIVE", "ARCHIVE", "PENDING", "REJECTED"],
      default: "PENDING",
    },
    additionalInfo: {
      comment: { type: String },
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    modifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
  },
);
VideoSchema.plugin(aggregatePaginate);

const Video = mongoose.model("Video", VideoSchema);

module.exports = Video;
