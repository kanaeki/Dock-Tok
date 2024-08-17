const mongoose = require("mongoose");
const mongoosePaginator = require("mongoose-aggregate-paginate-v2");
const winnerSchema = new mongoose.Schema(
  {
    award: {
      type: String,
      required: true,
    }, //shrt
    videoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
      required: true,
    },
    tag: {
      type: String,
    },
    awardType: {
      type: String,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reason: {
      type: String,
    },
    awardStatus: {
      type: String,
      enum: ["Sent", "pending"],
      deafult: "pending",
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    modifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
  },
);

winnerSchema.plugin(mongoosePaginator);
const Winner = mongoose.model("Winner", winnerSchema);
module.exports = Winner;
