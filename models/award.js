const mongoose = require("mongoose");

const awardSchema = mongoose.Schema(
  {
    award: {
      type: String,
      required: true,
    },
    awardType: {
      type: String,
      enum: ["GIFTPACK", "CASH"],
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    modifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);

const Award = mongoose.model("Award", awardSchema);
module.exports = Award;
