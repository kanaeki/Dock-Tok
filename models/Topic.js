const mongoose = require("mongoose");
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");

const TopicSchema = new mongoose.Schema(
  {
    title: { type: String },
    description: { type: String },
    mediaType: {
      type: String,
      default: "video",
    },
    videoDetail: { type: Object },
    featured: { type: Boolean, default: false },
    dataStatus: {
      type: String,
      enum: ["ACTIVE", "ARCHIVE"],
      default: "ACTIVE",
    },
    event: { type: Boolean, default: false },
    rules: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    modifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
    },
  },
  {
    timestamps: true,
  },
);

TopicSchema.plugin(aggregatePaginate);

const Topic = mongoose.model("Topic", TopicSchema);

module.exports = Topic;
