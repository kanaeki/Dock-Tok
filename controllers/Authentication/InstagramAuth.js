const { endpoint } = require("../../endpoint/endpoint");
const User = require("../../models/User");
const { findMintes } = require("../../utils/mixFunction");
const ErrorResponse = require("../../utils/errorResponse");
const axios = require("axios");
const qs = require("qs");
const { MESSAGE } = require("../../Constant/message");

// @desc    Exchange Code for Token
const client_id = process.env.INSTAGRAM_CLIENT_ID;
const client_secret = process.env.INSTAGRAM_CLIENT_SECRET;
const redirect_uri = "https://docktok.pixarsclients.com";

exports.instagramURL = async (req, res, next) => {
  try {
    const url = `${endpoint.instagramURL}${endpoint.instagramAuth}/?client_id=${process.env.INSTAGRAM_CLIENT_ID}&redirect_uri=${redirect_uri}&scope=user_profile,user_media&response_type=code`;
    return res.status(200).json({
      success: true,
      message: MESSAGE.INSTAGARAM_SUCCESS,
      data: url,
    });
  } catch (err) {
    return next(new ErrorResponse(err, 400));
  }
};

exports.instagramAccessToken = async (req, res, next) => {
  try {
    const { code } = req.body;
    const resp = await axios({
      method: "post",
      url: " https://api.instagram.com/oauth/access_token",
      data: qs.stringify({
        client_id: client_id,
        client_secret: client_secret,
        grant_type: "authorization_code",
        redirect_uri: `https://docktok.pixarsclients.com/`,
        code: code,
      }),
      Headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    console.log("here");
    console.log(resp.data.access_token);
    // console.log(resp.access_token);

    const userProfie = await profileDetail(resp.data.access_token);
    // console.log(userProfie);
    return res.status(200).json({
      success: true,
      message: MESSAGE.INSTAGARAM_SUCCESS,
      data: resp.data.access_token,
    });
  } catch (err) {
    console.log(err);
    return next(new ErrorResponse(err, 400));
  }
};
const profileDetail = async (access_token) => {
  try {
    const resp = await axios.get(
      `https://graph.instagram.com/me?fields=id,username,profile_picture_url&access_token=${access_token}`,
    );
    console.log("User Detail:", resp.data);
    return resp;
  } catch (err) {
    console.log(err);
  }
};
exports.exchangeInstagramCode = async (req, res, next) => {
  try {
    const { code } = req.body;

    axios
      .get(
        `${endpoint.instagramURL}/me?fields=id,username&access_token=${code}`,
      )
      .then((response) => {
        console.log("Access Token:", response.data.access_token);
        // Handle the response data
      })
      .catch((error) => {
        console.error(
          "Error:",
          error.response ? error.response.data : error.message,
        );
        // Handle the error
      });
    // let user = {};
    // user = await User.findOne({ email: body.email });
    // const expire = findMintes(body.data_access_expiration_time);
    // const fullName = body.name.split(" ");
    // if (!user) {
    //   user = await User.create({
    //     firstName: fullName[0],
    //     lastName: fullName[1],
    //     email: body.email,
    //     "socialConnect.google": body,
    //   });
    //   token = user.getSignedJwtToken(expire);
    // } else {
    //   user = await User.findOneAndUpdate(
    //     {
    //       email: body.email,
    //     },
    //     {
    //       "socialConnect.facebook": body,
    //     },
    //   );
    //   token = user?.getSignedJwtToken(expire);
    // }
    // user.password = undefined;
    res.status(200).json({
      success: true,
      message: MESSAGE.INSTAGARAM_SUCCESS,
      // token,
      // data: {
      //   user,
      // },
    });
  } catch (err) {
    return next(new ErrorResponse(err, 400));
  }
};
