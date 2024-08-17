const { MESSAGE } = require("../../Constant/message");
const ErrorResponse = require("../../utils/errorResponse");
const {
  s3Uploadv3,
  s3MultiUploadv3,
  s3Videov3,
} = require("../../utils/s3Bucket");

exports.videoUpload = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).send(MESSAGE.UPLOAD_ERROR);
    }

    const results = await s3Videov3(req.file);
    if (results) {
      console.log(results.result.Location);
      return res.json({
        status: "success",
        url: `${results.result.Location}`,
      });
    }
  } catch (err) {
    return next(new ErrorResponse(err, 400));
  }
};

exports.mediaUpload = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).send(MESSAGE.UPLOAD_ERROR);
    }

    const results = await s3Uploadv3(req.file).then((data) => {
      return res.json({
        status: "success",
        url: `${process.env.AWS_BUCKET_ENDPOINT}${data.path}`,
      });
    });
  } catch (err) {
    return next(new ErrorResponse(err, 400));
  }
};
exports.multiMediaUpload = async (req, res, next) => {
  try {
    const results = await s3MultiUploadv3(req.files);

    return res.json({ status: "success", results });
  } catch (err) {
    return next(new ErrorResponse(err, 400));
  }
};
