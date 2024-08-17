const { default: mongoose } = require("mongoose");
const { MESSAGE } = require("../../Constant/message");
const { Blog } = require("../../models/blog");
const { Category } = require("../../models/category");
const ErrorResponse = require("../../utils/errorResponse");
const { s3Uploadv3, s3Deletev3 } = require("../../utils/s3Bucket");

// @desc Create category
exports.createCategory = async (req, res, next) => {
  try {
    const { name, description, subcategory } = req.body;

    if (!name && !description) {
      return next(new ErrorResponse(MESSAGE.INVALID_DATA_REQUEST, 400));
    }
    if (!req.file) {
      return next(new ErrorResponse(MESSAGE.UPLOAD_ERROR, 400));
    }

    const category = await Category.create({
      name: name,
      description: description,
      subcategory: subcategory,
      createdBy: req.user._id,
      modifiedBy: req.user._id,
    });
    res.status(200).json({
      success: true,
      message: MESSAGE.CATEGORY_CREATE_SUCCESS,
      data: category,
    });
    const imageResult = await s3Uploadv3(req.file);
    if (imageResult) {
      await Category.findByIdAndUpdate(category._id, {
        image: imageResult,
      });
    }
  } catch (err) {
    return next(new ErrorResponse(err, 400));
  }
};

//@desc Get all Catogories
exports.getAllCategory = async (req, res, next) => {
  try {
    const allCategory = await Category.find();
    res.status(200).json({
      success: true,
      message: MESSAGE.CATEGORY_LIST,
      data: allCategory,
    });
  } catch (err) {
    return next(new ErrorResponse(err, 400));
  }
};

// @desc Delete a category
exports.deleteCategory = async (req, res, next) => {
  try {
    const categoryId = req.params.categoryId;
    const getCategory = await Category.findById(categoryId);
    if (!getCategory) {
      return next(new ErrorResponse(MESSAGE.CATEGORY_NOT_FOUND, 400));
    }
    const image = await s3Deletev3(getCategory.image.path);
    const uncategorized = await Category.findOne({ name: "Uncategorized" });
    const categoryBlog = await Blog.updateMany(
      {
        category: categoryId,
      },
      {
        $set: {
          category: uncategorized._id,
        },
      },
      {
        new: true,
      },
    );
    const category = await Category.findByIdAndDelete(categoryId);
    return res.json({
      success: true,
      message: MESSAGE.CATEGORY_DELETE_SUCCESS,
    });
  } catch (err) {
    return next(new ErrorResponse(err, 400));
  }
};

// @desc Update Category
exports.updateCategory = async (req, res, next) => {
  try {
    const categoryId = req.params.categoryId;
    const { name, description, subcategory } = req.body;

    if (!name && !description) {
      return next(new ErrorResponse(MESSAGE.INVALID_DATA_REQUEST, 400));
    }
    const getCategory = await Category.findById(categoryId);
    if (!getCategory) {
      return next(new ErrorResponse(MESSAGE.CATEGORY_NOT_FOUND, 400));
    }
    const category = await Category.findByIdAndUpdate(categoryId, {
      name,
      description,
      subcategory,
      modifiedBy: req.user._id,
    });
    res.status(202).json({
      success: true,
      message: MESSAGE.CATEGORY_UPDATE_SUCCESS,
      data: category,
    });
    if (req.file && req.file.size > 0) {
      const imageResult = await s3Uploadv3(req.file);
      await s3Deletev3(category.image.path);
      await Category.findByIdAndUpdate(categoryId, {
        image: imageResult,
      });
    }
  } catch (err) {
    return next(new ErrorResponse(err, 400));
  }
};
