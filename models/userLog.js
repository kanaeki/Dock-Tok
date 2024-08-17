const mongoose = require("mongoose");

const userLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const userLog = mongoose.model("UserLog", userLogSchema);
module.exports = userLog;
