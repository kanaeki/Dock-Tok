const ErrorResponse = require("../../utils/errorResponse");
const { MESSAGE } = require("../../Constant/message");
const { BlogHistory } = require("../../models/blogHistory");
const { s3Deletev3 } = require("../../utils/s3Bucket");

const saveBlogVersion = async (originalBlog) => {
  try {
    // wconsole.log(originalBlog);
    const newVersion = BlogHistory({
      originalBlogId: originalBlog._id,
      title: originalBlog.title,
      content: originalBlog.content,
      category: originalBlog.category,
      videoDetail: originalBlog.videoDetail,
      createdBy: originalBlog.createdBy,
      modifiedBy: originalBlog.modifiedBy,
    });
    await newVersion.save();
    const allVersion = await BlogHistory.find({
      originalBlogId: originalBlog._id,
    }).sort({ createdAt: -1 });
    // console.log(allVersion);
    if (allVersion.length > process.env.BLOG_REVISIONS) {
      const versionToDelete = allVersion.slice(process.env.BLOG_REVISIONS);
      const delPromise = versionToDelete.map(async (ver) => {
        // await s3Deletev3(ver.videoDetail.path);
        return BlogHistory.findByIdAndDelete(ver._id);
      });
      await Promise.all(delPromise);
    }
  } catch (err) {}
};

module.exports = { saveBlogVersion };
