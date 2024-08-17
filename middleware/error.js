const { logEvents } = require("./logger");
const ErrorResponse = require("../utils/errorResponse");

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  logEvents(
    `${err.name}: ${err.message}\t${err.stack}\t${req.method}\t${req.url}\t${req.headers.origin}`,
    "errLog.log"
  );
  error.message = err.message;
  console.log(err.message);
  if (err.code === 11000) {
    const message = `Duplicate Field value entered`;
    error = new ErrorResponse(message, 400);
  }

  if (err.name === "ValidationError") {
    const message = Object.values(err.errors).map((val) => val.message);
    error = new ErrorResponse(message, 400);
  }

  console.log(error.message);

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || "Server Error",
  });
};

module.exports = errorHandler;
