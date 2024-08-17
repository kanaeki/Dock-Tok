const { startOfWeek, endOfWeek, startOfDay, endOfDay } = require("date-fns");
const userLog = require("../../models/userLog");
const ErrorResponse = require("../../utils/errorResponse");

exports.createLog = async (user) => {
  const log = await userLog.create({
    user: user._id,
  });
};

//@desc Get a weekly Log Count of the login Users
exports.weekLog = async (req, res, next) => {
  try {
    const startweek = startOfWeek(new Date());
    const endWeek = endOfWeek(new Date());
    let datalist = [];
    for (let day = startweek; day <= endWeek; day.setDate(day.getDate() + 1)) {
      const startOfDayDate = startOfDay(new Date(day));
      const endOfDayDate = endOfDay(new Date(day));
      const log = await userLog.countDocuments({
        createdAt: {
          $gte: startOfDayDate,
          $lte: endOfDayDate,
        },
      });

      let data = {
        date: startOfDayDate,
        count: log,
      };
      datalist.push(data);
    }
    res.status(200).json({
      success: true,
      data: datalist,
    });
  } catch (err) {
    return next(new ErrorResponse(err, 400));
  }
};
