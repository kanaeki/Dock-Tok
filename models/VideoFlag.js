const mongoose = require("mongoose");

const videoFlagSchema = new mongoose.Schema(
  {
    message: {
      type: String,
    },
    type: {
      type: String,
      enum: [
        "SEXUAL_CONTENT",
        "CHILD_ABUSE",
        "VOILENT_OR_REPELSIVE_CONTENT",
        "HATEFUL_CONTENT",
        "HARMFUL_ACTS",
        "MISINFORMATION",
        "SPAM",
        "CAPTION_ISSUES",
        "LEGAL_ISSUES",
        "OTHER",
      ],
    },
    videoId: { type: mongoose.Schema.Types.ObjectId, ref: "Video" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    modifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
  },
);

const VideoFlag = mongoose.model("VideoFlag", videoFlagSchema);

module.exports = VideoFlag;
