const User = require("../../models/User");
const { findMintes } = require("../../utils/mixFunction");
const ErrorResponse = require("../../utils/errorResponse");
const { endpoint } = require("../../endpoint/endpoint");
const axios = require("axios");
const { MESSAGE } = require("../../Constant/message");

// @desc    Facebook Authenticate
exports.authenticateFacebook = async (req, res, next) => {
  try {
    // Check that user exists by email
    const body = req.body;
    let user = {};
    user = await User.findOne({ email: body.email });
    const expire = findMintes(body.data_access_expiration_time);
    const fullName = body.name.split(" ");
    if (!user) {
      user = await User.create({
        firstName: fullName[0],
        lastName: fullName[1],
        email: body.email,
        "socialConnect.facebook": body,
      });
      token = user.getSignedJwtToken(expire);
    } else {
      user = await User.findOneAndUpdate(
        {
          email: body.email,
        },
        {
          "socialConnect.facebook": body,
        },
      );
      token = user?.getSignedJwtToken(expire);
    }
    user.password = undefined;
    res.status(200).json({
      success: true,
      message: MESSAGE.FACEBOOK_SUCCESS,
      token,
      data: {
        user,
      },
    });
  } catch (err) {
    return next(new ErrorResponse(err, 400));
  }
};

exports.getLikeFacebook = async (req, res, next) => {
  try {
    axios
      .get(
        `${endpoint.facebookURL}/me?fields=id,name,likes&access_token=${req.user.socialConnect.facebook.accessToken}`,
      )
      .then((response) => {
        res.status(200).json({
          success: true,
          message: MESSAGE.FACEBOOK_LIKE,
          data: response.data,
        });
      })
      .catch((error) => {
        console.error(
          "Error:",
          error.response ? error.response.data : error.message,
        );
        return next(new ErrorResponse(error.message, 400));
        // Handle the error
      });
  } catch (err) {
    return next(new ErrorResponse(err, 400));
  }
};
