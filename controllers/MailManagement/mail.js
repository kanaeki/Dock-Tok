const { MESSAGE } = require("../../Constant/message");
const Mail = require("../../models/mail");
const User = require("../../models/User");
const ErrorResponse = require("../../utils/errorResponse");

exports.createMailUser = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return next(new ErrorResponse(MESSAGE.INVALID_DATA_REQUEST, 400));
    }
    // const checkEmail = await User.findOne({
    //   _id: req.user.id,
    //   email: email,
    // });
    // if (checkEmail == null) {
    //   return next(new ErrorResponse("please Enter your Email", 400));
    // }
    const exist = await Mail.findOne({
      email: email,
    });
    if (exist) {
      return next(new ErrorResponse("Email is already exist", 400));
    }
    const user = await Mail.create({
      userId: req.user._id,
      email: email,
      createdBy: req.user.id,
      modifiedBy: req.user.id,
    });

    return res
      .status(201)
      .json({ success: true, message: MESSAGE.MAIL_CREATION, data: user });
  } catch (err) {
    return next(new ErrorResponse(err, 400));
  }
};

exports.getMailUser = async (req, res, next) => {
  try {
    const user = await Mail.findById(req.params.id).populate(
      "userId",
      "firstName lastName additionaInfo.profileImage",
    );
    if (!user) {
      return next(new ErrorResponse(MESSAGE.MAIL_NOT_FOUND, 404));
    }
    return res.status(200).json({
      success: true,
      message: MESSAGE.Mail_DETAIL,
      data: user,
    });
  } catch (err) {
    return next(new ErrorResponse(err, 400));
  }
};

exports.getAllMails = async (req, res, next) => {
  try {
    const { page = 1, limit = 5 } = req.query;
    const count = await Mail.countDocuments();
    const allUsers = await Mail.find()
      .populate("userId", "firstName lastName additionaInfo.profileImage")
      .limit(limit * 1)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .exec();

    return res.status(200).json({
      success: true,
      message: MESSAGE.MAIL_LIST,
      data: allUsers,
      count: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
    });
  } catch (err) {
    return next(new ErrorResponse(err, 400));
  }
};

exports.delUser = async (req, res, next) => {
  try {
    const decodedUserId = Buffer.from(req.query.user, "base64").toString(
      "ascii",
    );
    console.log(req.query.user);
    // const user = await Mail.deleteOne({ _id: decodedUserId }, { new: true });
    // if (!user) {
    //   return next(new ErrorResponse(err, 400));
    // }
    res.status(200).json({
      success: true,
      message: MESSAGE.MAIL_DELETED,
    });
  } catch (err) {
    return next(new ErrorResponse(err, 400));
  }
};
