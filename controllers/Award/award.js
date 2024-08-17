const { MESSAGE } = require("../../Constant/message");
const Award = require("../../models/award");
const ErrorResponse = require("../../utils/errorResponse");

//@desc Add Award
exports.addAward = async (req, res, next) => {
  try {
    const { award, awardType } = req.body;
    if (!award || !awardType) {
      return next(new ErrorResponse(MESSAGE.INVALID_DATA_REQUEST, 400));
    }

    const newAward = await Award.create({
      award: award,
      awardType: awardType,
      createdBy: req.user._id,
      modifiedBy: req.user._id,
    });
    return res.status(200).json({
      success: true,
      message: MESSAGE.AWARD_CRAEATION_SUCCESS,
      data: newAward,
    });
  } catch (err) {
    return next(new ErrorResponse(err, 400));
  }
};

//@desc Get all Awards
exports.getallAwards = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      pagination = false,
      search = "",
      filter = "",
    } = req.query;

    if (pagination == "true") {
      let query = {};
      switch (filter) {
        case "GIFTPACK":
          query = {
            awardType: "GIFTPACK",
          };
          break;
        case "CASH":
          query = {
            awardType: "CASH",
          };
          break;
      }
      if (search != "") {
        query = { award: { $regex: `.*${search}.*`, $options: "i" } };
      }
      const getAwards = await Award.find(query)
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .sort({ createdAt: 1 })
        .exec();
      const count = await Award.countDocuments(query);
      return res.status(200).json({
        success: true,
        message: MESSAGE.AWARD_LIST,
        data: getAwards,
        count: count,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page),
      });
    } else {
      const getAwards = await Award.aggregate([
        {
          $group: {
            _id: "$awardType", // Group by awardType
            awards: { $push: "$$ROOT" }, // Push all fields of the document into an array
          },
        },
      ]);
      return res.status(200).json({
        success: true,
        message: MESSAGE.AWARD_LIST,
        data: getAwards,
      });
    }
  } catch (err) {
    return next(new ErrorResponse(err, 400));
  }
};

//@desc update Award
exports.updateAward = async (req, res, next) => {
  try {
    const { award, awardType } = req.body;
    if (!award && !awardType) {
      return next(new ErrorResponse(MESSAGE.INVALID_DATA_REQUEST, 400));
    }
    const newAward = await Award.findByIdAndUpdate(
      req.params.id,
      {
        award: award,
        awardType: awardType,
      },
      {
        new: true,
      },
    );

    return res.status(200).json({
      success: true,
      message: MESSAGE.AWARD_UPDATED_SUCCESSFULLY,
      data: newAward,
    });
  } catch (err) {
    return next(new ErrorResponse(err, 400));
  }
};

//@desc delete Award
exports.deleteAward = async (req, res, next) => {
  try {
    const del = await Award.findByIdAndDelete(req.params.id, {
      new: true,
    });
    if (!del) {
      return next(new ErrorResponse(MESSAGE.INVALID_DATA_REQUEST, 400));
    }
    return res.status(200).json({
      success: true,
      message: MESSAGE.AWARD_DEL,
      data: del,
    });
  } catch (err) {
    return next(new ErrorResponse(err, 400));
  }
};

//@desc get Single award
exports.getSingleAward = async (req, res, next) => {
  try {
    const award = await Award.findOne({
      _id: req.params.id,
    });
    if (!award) {
      return next(new ErrorResponse(MESSAGE.INVALID_DATA_REQUEST, 400));
    }
    return res.status(200).json({
      success: true,
      message: MESSAGE.AWARD_DETAIL,
      data: award,
    });
  } catch (err) {}
};
