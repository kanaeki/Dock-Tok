const mongoose = require("mongoose");

const VoteSchema = new mongoose.Schema(
  {
    like: {
      type: String,
      enum: ["LIKE", "DISLIKE"],
      default: "LIKE",
      required: true,
    },
    videoId: { type: mongoose.Schema.Types.ObjectId, ref: "Video" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    modifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
  },
);

const Vote = mongoose.model("Vote", VoteSchema);

module.exports = Vote;
