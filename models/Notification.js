const mongoose = require("mongoose");

const notificationModel = mongoose.Schema(
  {
    title: { type: String, required: true },
    message: { type: String },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    readStatus: { type: Boolean, default: false },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    data: { type: Object },
    type: {
      type: String,
      enum: [
        "VOTE",
        "CHALLENGE",
        "COMMENT",
        "TOPIC",
        "VIDEO_POST",
        "WINNER",
        "EVENT",
        "BLOG",
        "APPROVAL",
      ],
    },
  },
  { timestamps: true },
);

const Notification = mongoose.model("Notification", notificationModel);

module.exports = Notification;
