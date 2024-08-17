const { endpoint } = require("../../endpoint/endpoint");
const User = require("../../models/User");
const { findMintes } = require("../../utils/mixFunction");
const ErrorResponse = require("../../utils/errorResponse");
const axios = require("axios");
const { MESSAGE } = require("../../Constant/message");

// @desc    Exchange Code for Token
const client_id = process.env.TIKTOK_CLIENT_KEY;
const client_secret = process.env.TIKTOK_CLIENT_SECRET;
const redirect_uri = "https://f8f3-101-53-234-95.ngrok-free.app/login";

exports.tiktokLoginURL = async (req, res, next) => {
  try {
    const url = `${endpoint.tiktokURL}${endpoint.tiktokAuth}/?client_key=${process.env.TIKTOK_CLIENT_KEY}&scope=user.info.basic,user.info.profile,user.info.stats,video.list&response_type=code&state=${Math.random().toString(36).substring(2)}&redirect_uri=${process.env.TIKTOK_REDIRECT_URL}`;
    return res.status(200).json({
      success: true,
      message: MESSAGE.TIKTOK_SUCCESS,
      data: url,
    });
  } catch (err) {
    return next(new ErrorResponse(err, 400));
  }
};

exports.tiktokAccessToken = async (req, res) => {
  try {
    const { code } = req.body;
    console.log(code);
    const response = await axios.post(
      endpoint.tiktokURL + endpoint.tiktokAuth,
      {
        client_id: client_id,
        client_secret: client_secret,
        grant_type: "authorization_code",
        code: code,
        redirect_uri: redirect_uri,
      },
    );
    if (response.data.access_token) {
    }
  } catch (err) {
    return next(new ErrorResponse(err, 400));
  }
};
