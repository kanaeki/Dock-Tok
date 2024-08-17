const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
// Controllers
const {
  authenticateGoogle,
  refreshTokenGoogle,
} = require("../controllers/Authentication/GoogleAuth");
const {
  authenticateFacebook,
} = require("../controllers/Authentication/FacebookAuth");
const {
  exchangeInstagramCode,
  instagramURL,
  instagramAccessToken,
} = require("../controllers/Authentication/InstagramAuth");
const { tiktokLoginURL } = require("../controllers/Authentication/TikTokAuth");
const {
  register,
  login,
  Verify2FaCode,
  emailVerifyCode,
  resetPassword,
  verifyResetPassword,
  resend2faAuthentication,
  resendEmailVerification,
} = require("../controllers/Authentication/auth");

router.route("/login").post(login);
router.route("/resend/2fa").post(resend2faAuthentication);
router.route("/login/otp").post(Verify2FaCode);
router.route("/register").post(register);
router.route("/resend/verify").post(resendEmailVerification);
router.route("/register/otp").post(emailVerifyCode);
router.route("/facebook").post(authenticateFacebook);
router.route("/google").post(authenticateGoogle);
router.route("/google/refresh").post(refreshTokenGoogle);
router.route("/tiktok/url").get(tiktokLoginURL);
router.route("/instagram/url").get(instagramURL);
router.route("/instagram/token").post(instagramAccessToken);
router.route("/instagram/exchange/code").post(exchangeInstagramCode);
router.route("/reset/password").post(resetPassword);
router.route("/reset/otp").post(verifyResetPassword);

module.exports = router;
