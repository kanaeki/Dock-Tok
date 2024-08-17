const { MESSAGE } = require("../../Constant/message");
const User = require("../../models/User");
const ErrorResponse = require("../../utils/errorResponse");
const { s3Uploadv3 } = require("../../utils/s3Bucket");
const { staffMail } = require("../../utils/sendEmail");
const crypto = require("crypto");
//@desc Add  New Staff member
exports.addStaff = async (req, res, next) => {
  try {
    const exist = req.query.exist;
    const { firstName, lastName, email, role } = req.body;

    let user;
    if (exist == "true") {
      user = await User.findOneAndUpdate(
        {
          email: email,
        },
        {
          "additionalInfo.assignRole": role,
          createdBy: req.user.id,
          modifiedBy: req.user.id,
        },
        {
          new: true,
        },
      );
    } else {
      const checkUser = await User.findOne({
        email: email,
      });
      if (checkUser) {
        return next(new ErrorResponse("Email already exist", 400));
      }
      user = await User.create({
        firstName: firstName,
        lastName: lastName,
        email: email,
        userRole: "staff",
        "additionalInfo.assignRole": role,
        createdBy: req.user.id,
        modifiedBy: req.user.id,
        emailVerified: true,
        password: "qwerty",
      });
    }
    res.status(200).json({
      success: true,
      message: MESSAGE.STAFF_ADD,
      data: user,
    });

    await staffMail(user);
    // }
  } catch (err) {
    return next(new ErrorResponse(err, 400));
  }
};

//@desc Get all Staff members
exports.getAllStaff = async (req, res, next) => {
  try {
    let query = {};
    let count;
    const { page = 1, limit = 10, search = "", filter = "all" } = req.query;
    switch (filter) {
      case "lastMonth": {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        query = {
          userRole: "staff",
          createdAt: {
            $gte: firstDay,
            $lte: lastDay,
          },
        };

        break;
      }
      case "threeMonth": {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth() - 3, 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        query = {
          userRole: "staff",
          createdAt: {
            $gte: firstDay,
            $lte: lastDay,
          },
        };
        break;
      }
      case "lastYear": {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), 0, 1);
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        query = {
          userRole: "staff",
          createdAt: {
            $gte: firstDay,
            $lte: lastDay,
          },
        };
        break;
      }
      default: {
        query = { userRole: "staff" };
        break;
      }
    }

    if (search !== null && search !== "") {
      let searchWord = search?.split(" ");
      query = {
        ...query,
        $or: [
          {
            firstName: { $regex: `.*${searchWord[0]}.*`, $options: "i" },
          },
          {
            email: { $regex: `.*${searchWord[0]}.*`, $options: "i" },
          },
          {
            lastName: {
              $regex: `.*${searchWord[1] ? searchWord[1] : searchWord[0]}.*`,
              $options: "i",
            },
          },
        ],
      };
    }
    count = await User.countDocuments(query);
    const userData = await User.find(query, {
      username: 1,
      createdAt: 1,
      "additionalInfo.profileImage": 1,
      "additionalInfo.assignRole": 1,
      firstName: 1,
      lastName: 1,
      email: 1,
      dataStatus: 1,
    })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();
    res.status(200).json({
      success: true,
      data: userData,
      count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
    });
  } catch (err) {
    return next(new ErrorResponse(err, 400));
  }
};
//@desc Get Details of a  Staff member
exports.getStaff = async (req, res, next) => {
  try {
    const userData = await User.findById(
      { _id: req.params.id },
      {
        email: 1,
        firstName: 1,
        lastName: 1,
        createdAt: 1,
        "additionalInfo.assignRole": 1,
        "additionalInfo.location": 1,
        "additionalInfo.profileImage": 1,
      },
    );
    res.status(200).json({
      success: true,
      data: userData,
    });
  } catch (err) {
    return next(new ErrorResponse(err, 400));
  }
};

//@desc Update a staff Staff members
exports.updateStaff = async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      gender,
      dateOfBirth,
      phoneNumber,
      location,
      role,
    } = req.body;
    let user;
    user = await User.findByIdAndUpdate(
      req.params.id,
      {
        firstName: firstName,
        lastName: lastName,
        "additionalInfo.gender": gender,
        "additionalInfo.phoneNumber": phoneNumber,
        "additionalInfo.location": location,
        "additionalInfo.assignRole": role,
      },
      {
        new: true,
      },
    );
    if (dateOfBirth != undefined) {
      user["additionalInfo.dateOfBirth"] = parseISO(dateOfBirth);
    }
    if (req.file && req.file.size > 0) {
      const imageResult = await s3Uploadv3(req.file);
      user = await User.findByIdAndUpdate(
        req.params.id,
        {
          "additionalInfo.profileImage": imageResult.path,
        },
        {
          new: true,
        },
      );
    }

    res.status(200).json({
      success: true,
      message: MESSAGE.STAFF_UPDATE,
      data: user,
    });
  } catch (err) {
    return next(new ErrorResponse(err, 400));
  }
};

//@desc Delete a staff Staff members
exports.deleteStaff = async (req, res, next) => {
  try {
    const delUser = await User.findByIdAndDelete(
      {
        _id: req.params.id,
      },
      {
        new: true,
      },
    );
    return res.status(200).json({
      success: true,
      message: MESSAGE.STAFF_DELETE,
      data: delUser,
    });
  } catch (err) {
    return next(new ErrorResponse(err, 400));
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.query.token)
      .digest("hex");
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });
    if (!user) {
      return next(new ErrorResponse(MESSAGE.TOKEN_ERROR, 400));
    }
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    return res.status(200).json({
      success: true,
      messsage: MESSAGE.PASSWORD_UPDATE_SUCCESS,
    });
  } catch (err) {
    return next(new ErrorResponse(err, 400));
  }
};
