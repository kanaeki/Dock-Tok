const mongoose = require("mongoose");
const { MESSAGE } = require("../../Constant/message");
const ErrorResponse = require("../../utils/errorResponse");
const { seedCategories } = require("../../models/seeders/category");

exports.flushdb = async (req, res, next) => {
  try {
    const collections = await mongoose.connection.listCollections();
    for (let collection of collections) {
      if (collection.name === "users" || collection.name === "emails") {
        continue;
      }
      await mongoose.connection.collection(collection.name).deleteMany();
      await seedCategories();
    }
    return res.status(200).json({
      success: true,
      message: MESSAGE.FLUSH_SUCCESSFUL,
    });
  } catch (err) {
    return next(new ErrorResponse(err, 400));
  }
};
