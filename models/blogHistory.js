const mongoose = require("mongoose");

const blogHistorySchema = new mongoose.Schema(
  {
    originalBlogId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Blog",
    },
    title: { type: String, required: true },
    content: {
      type: String,
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    videoDetail: {
      type: Object,
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

const BlogHistory = mongoose.model("BlogHistory", blogHistorySchema);

module.exports = { BlogHistory };
