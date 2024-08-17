const jwt = require("jsonwebtoken");
const ErrorResponse = require("../utils/errorResponse");
const User = require("../models/User");
const { MESSAGE } = require("../Constant/message");
exports.protect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return next(new ErrorResponse("Not authorized to access this route", 401));
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await User.findById(decoded.id);

    if (!user) {
      return next(new ErrorResponse("No user found", 404));
    }
    if (user.dataStatus === "block") {
      return next(new ErrorResponse("User is blocked", 401));
    }
    req.user = user;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return next(new ErrorResponse("Token has expired", 401));
    }
    return next(
      new ErrorResponse(`Not authorized to access this router.`, 401),
    );
  }
};

exports.adminProtect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return next(new ErrorResponse(MESSAGE.ACCESS_DENIED, 401));
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await User.findById(decoded.id);
    if (!user) {
      return next(new ErrorResponse(MESSAGE.USER_NOT_FOUND, 404));
    }
    if (user.userRole !== "admin") {
      return next(new ErrorResponse(MESSAGE.ACCESS_DENIED, 401));
    }

    req.user = user;
    next();
  } catch (err) {
    if (err === "") return next(new ErrorResponse(MESSAGE.ACCESS_DENIED, 401));
  }
};

exports.authenticateUser = async (req, res, next) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    const token = req.headers.authorization.split(" ")[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

      const user = await User.findById(decoded.id);
      if (!user) {
        return next(new ErrorResponse("No user found with this id", 404));
      }
      if (user.dataStatus === "block") {
        return next(new ErrorResponse("User is blocked", 401));
      }

      req.user = user;
      next();
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        next();
      }
    }
  } else {
    next();
  }
};

exports.authenticateStaff = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return next(new ErrorResponse("Not authorized to access this route", 401));
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await User.findById(decoded.id);
    if (!user) {
      return next(new ErrorResponse(MESSAGE.USER_NOT_FOUND, 404));
    } else {
      if (user.userRole == "admin" || user.userRole == "staff") {
        req.user = user;
        next();
      } else {
        console.log(req.user);
        return next(new ErrorResponse(MESSAGE.ACCESS_DENIED, 401));
      }
    }
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return next(new ErrorResponse("Token has expired", 401));
    }
    return next(
      new ErrorResponse(`Not authorized to access this router.`, 401),
    );
  }
};
