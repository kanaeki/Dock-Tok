const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
  {
    title: { type: String },

    content: {
      type: String,
      required: true,
    },
    mediaType: {
      type: String,
      default: "video",
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    videoDetail: { type: Object },
    featured: {
      type: Boolean,
      default: false,
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

const Blog = mongoose.model("Blog", blogSchema);

module.exports = { Blog };
