const { MESSAGE } = require("../../Constant/message");
const Email = require("../../models/email");

const ErrorResponse = require("../../utils/errorResponse");

// @desc Create Email template
exports.createTemplate = async (req, res, next) => {
  try {
    const { title, type, subject, content } = req.body;
    if (!title || !content || !type || !subject) {
      return next(new ErrorResponse(MESSAGE.INVALID_DATA_REQUEST, 400));
    }
    const emailTemplate = await Email.create({
      title: title,
      type: type,
      subject: subject,
      content: content,
      createdBy: req.user._id,
      modifiedBy: req.user._id,
    });
    return res.status(200).json({
      success: true,
      message: MESSAGE.TEMPLATE_CREATE,
      data: emailTemplate,
    });
  } catch (err) {
    return next(new ErrorResponse(err, 400));
  }
};
// @desc Get all Email template
exports.getAlltemplates = async (req, res, next) => {
  try {
    const emailTemplates = await Email.find();
    if (emailTemplates.length === 0) {
      return res.status(200).json({
        success: true,
        message: MESSAGE.NO_EMAIL_TEMPLATE,
      });
    }
    return res.status(200).json({
      success: true,
      message: MESSAGE.TEMPLATE_LIST,
      data: emailTemplates,
    });
  } catch (err) {
    return next(new ErrorResponse(err, 400));
  }
};
// @desc Get a sinlge  Email template
exports.getTemplate = async (req, res, next) => {
  try {
    const emailTEmplate = await Email.findById(req.params.id);
    if (!emailTEmplate) {
      return next(new ErrorResponse(MESSAGE.c, 404));
    }
    return res.status(200).json({
      success: true,
      message: MESSAGE.TEMPLATE_DETAIL,
      data: emailTEmplate,
    });
  } catch (err) {
    return next(new ErrorResponse(err, 400));
  }
};

// @desc Update an Email template
exports.updateTemplate = async (req, res, next) => {
  try {
    const { title, type, content, subject } = req.body;
    if (!title && !content && !type && !subject) {
      return next(new ErrorResponse(MESSAGE.INVALID_DATA_REQUEST, 400));
    }
    const updatedTemplate = await Email.findByIdAndUpdate(
      req.params.id,
      {
        title: title,
        type: type,
        content: content,
        subject: subject,
        modifiedBy: req.user._id,
      },
      {
        new: true,
      },
    );
    return res.status(200).json({
      success: true,
      message: MESSAGE.TEMPLATE_UPDATE,
      data: updatedTemplate,
    });
  } catch (err) {
    return next(new ErrorResponse(err, 400));
  }
};

// @desc Delete an Email template
exports.deleteTemplate = async (req, res, next) => {
  try {
    const deletedTemplate = await Email.findByIdAndDelete(req.params.id);
    if (!deletedTemplate) {
      return res.status(404).json({
        success: false,
        message: MESSAGE.NOT_FOUND,
      });
    } else {
      return res.status(200).json({
        success: true,
        message: MESSAGE.TEMPLATE_DELETE_SUCCESS,
        data: deletedTemplate,
      });
    }
  } catch (err) {
    return next(new ErrorResponse(err, 400));
  }
};
