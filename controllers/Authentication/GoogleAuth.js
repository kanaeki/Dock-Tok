const { OAuth2Client, UserRefreshClient } = require("google-auth-library");
const { google } = require("googleapis");
const ErrorResponse = require("../../utils/errorResponse");
const User = require("../../models/User");
const { findMintes } = require("../../utils/mixFunction");
const { MESSAGE } = require("../../Constant/message");
const oAuth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "postmessage",
);
// @desc    Google Authenticate
exports.authenticateGoogle = async (req, res, next) => {
  try {
    // Check that user exists by email
    const { tokens } = await oAuth2Client.getToken(req.body.code); // exchange code for tokens
    let token = null;
    let user = {};
    // Create a Google People API client
    const userProfile = await getProfileDetail(tokens);
    user = await User.findOne({ email: userProfile?.emailAddresses[0]?.value });
    let refeshToken = await refreshTokenFnGoogle(tokens.refresh_token);
    const expire = findMintes(refeshToken.expiry_date);
    if (!user) {
      user = await User.create({
        firstName: userProfile.names[0].givenName,
        lastName: userProfile.names[0].familyName,
        email: userProfile.emailAddresses[0].value,
        "socialConnect.google": refeshToken,
      });
      token = user.getSignedJwtToken(expire);
    } else {
      user = await User.findOneAndUpdate(
        {
          email: userProfile?.emailAddresses[0]?.value,
        },
        {
          "socialConnect.google": refeshToken,
        },
      );
      token = user?.getSignedJwtToken(expire);
    }
    user.password = undefined;
    res.status(200).json({
      success: true,
      message: "Google Authenticate successfully",
      token,
      data: {
        user,
      },
    });
  } catch (err) {
    return next(new ErrorResponse(err, 400));
  }
};
const getProfileDetail = async (accessToken) => {
  oAuth2Client.setCredentials(accessToken);
  const people = google.people({
    version: "v1",
    auth: oAuth2Client,
  });
  // Get user profile details including profile image
  const userProfile = await people.people.get({
    resourceName: "people/me",
    personFields: "names,emailAddresses,photos",
  });
  //
  return userProfile.data;
};
//@desc get youtubeChannel detail
exports.getYouTubeChannelDetail = async (req, res, next) => {
  try {
    oAuth2Client.setCredentials(req.user.socialConnect.google);
    const youtube = google.youtube({
      version: "v3",
      auth: oAuth2Client,
    });
    const resp = await youtube.subscriptions.list({
      part: "snippet,contentDetails,id",
      mine: true,
      forChannelId: "UCmnPsyey2_EHuEEcp8-mlWg",
      maxResults: 50,
    });

    if (resp.data.items.length === 0) {
      return res.status(403).json({
        success: false,
        data: {
          items: [
            {
              snippet: {
                title: "Dock Tok",
                description: "Coffee and Signed Book Bundle 👇🏼",
                resourceId: {
                  kind: "youtube#channel",
                  channelId: "UCmnPsyey2_EHuEEcp8-mlWg",
                },
                channelId: "UCmnPsyey2_EHuEEcp8-mlWg",
                thumbnails: {
                  default: {
                    url: "https://yt3.ggpht.com/X4Dbsaq8cWpvd5oKH7xNlMtO6EU7op2hDb4Qyt0rxE2LX0Wz3bhQ3YOf8OaUv4qjj-GbdSYAyw=s800-c-k-c0x00ffffff-no-rj",
                  },
                },
              },
            },
          ],
        },
      });
    }
    return res.status(200).json({
      success: true,
      data: resp.data,
    });
  } catch (err) {
    return next(new ErrorResponse(err, 400));
  }
};
// @desc Subcribe to the channel
exports.subscribeYoutubeChannel = async (req, res, next) => {
  try {
    oAuth2Client.setCredentials(req.user.socialConnect.google);
    const youtube = google.youtube({
      version: "v3",
      auth: oAuth2Client,
    });
    let resource = {
      snippet: {
        resourceId: {
          channelId: "UCmnPsyey2_EHuEEcp8-mlWg",
        },
      },
    };
    const resp = await youtube.subscriptions.insert({
      part: "snippet",
      resource,
    });
    return res.status(200).json({
      success: true,
      message: MESSAGE.SUBSCRIPTIONS_CREATE_SUCCESS,
      data: resp.data,
    });
  } catch (err) {
    return next(new ErrorResponse(err, 400));
  }
};
const refreshTokenFnGoogle = async (refreshToken) => {
  const user = new UserRefreshClient(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    refreshToken,
  );
  const { credentials } = await user.refreshAccessToken(); // optain new tokens
  return credentials;
};
// @desc Refresh Token By Google
exports.refreshTokenGoogle = async (req, res, next) => {
  try {
    if (!req.body.refreshToken) {
      return next(new ErrorResponse(MESSAGE.GOOGLE_TOKEN_ERROR, 400));
    }
    const user = new UserRefreshClient(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      req.body.refreshToken,
    );
    const { credentials } = await user.refreshAccessToken(); // optain new tokens
    res.status(200).json({
      success: true,
      message: MESSAGE.GOOGLE_REFRESH_TOKEN,
      credentials,
    });
  } catch (err) {
    return next(new ErrorResponse(err, 400));
  }
};
