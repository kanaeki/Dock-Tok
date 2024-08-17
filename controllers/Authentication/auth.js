const crypto = require("crypto");
const ErrorResponse = require("../../utils/errorResponse");
const User = require("../../models/User");
const { logEvents } = require("../../middleware/logger");
const randomize = require("randomatic");
const { createNotification } = require("../../utils/notification");
const Notification = require("../../models/Notification");
const { MESSAGE } = require("../../Constant/message");
const { createLog } = require("../UserManagement/logs");
const userLog = require("../../models/userLog");
const Email = require("../../models/email");
const { sendEmail, mail } = require("../../utils/sendEmail");

// @desc    Login user
exports.login = async (req, res, next) => {
  let stripeDetail;
  const { email, password } = req.body;
  // Check if email and password is provided
  if (!email || !password) {
    return next(new ErrorResponse(MESSAGE.PASSWORD_ERROR, 400));
  }
  try {
    // Check that user exists by email

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return next(new ErrorResponse(MESSAGE.CREDENTIALS_ERROR, 400));
    }

    // Check that password match
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return next(new ErrorResponse(MESSAGE.CREDENTIALS_ERROR, 400));
    }
    if (user.emailVerified == false) {
      checkError = true;
      return emailVerify(user, 400, res, MESSAGE.EMAIL_VERIFICATION_ERROR);
      // return next(new ErrorResponse("E-mail is not verified", 401));
    }

    return verify2FA(user, 200, res, MESSAGE.EMAIL_2FA);
    // sendToken(user, 200, res);
  } catch (err) {
    return next(new ErrorResponse(err, 400));
  }
};
// @desc sending 2FA Email
const verify2FA = async (user, statusCode, res, rsp) => {
  const verifyotpToken = user.generateOtpToken();
  await user.save();
  const template = await Email.findOne({
    type: "2FA_AUTHENTICATION",
  });
  if (template !== null) {
    let str = template.content.replace(/@\{code\}/g, verifyotpToken);
    if (str.includes("@{firstName}")) {
      str = str.replace(/@\{firstName\}/g, user.firstName);
    }
    if (str.includes("@{lastName}")) {
      str = str.replace(/@\{lastName\}/g, user.lastName);
    }
  }

  const values = {
    user: user.firstName,
    header: "2FA AUTHENTICATION",
    content: `Your DockTok 2FA Authentication code is ${verifyotpToken}`,
    btnLink: process.env.OTP_PAGE,
    btnText: "Visit Site",
  };
  let message = mail(values);

  sendEmail({
    to: user.email,
    subject: template ? template.subject : "2Fa Authentication",
    text: message,
  });
  return res.status(statusCode).json({
    success: true,
    message: `${MESSAGE.EMAIL_2FA}`,
  });
};

exports.resend2faAuthentication = async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    return next(new ErrorResponse(MESSAGE.EMAIL_ERROR, 400));
  }
  try {
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return next(new ErrorResponse(MESSAGE.CREDENTIALS_ERROR, 401));
    }
    return verify2FA(user, 200, res, MESSAGE.EMAIL_2FA);
  } catch (err) {
    return next(new ErrorResponse(err, 400));
  }
};

// @desc Veify the 2FA Code
exports.Verify2FaCode = async (req, res, next) => {
  const otpToken = crypto
    .createHash("sha256")
    .update(req.body.code)
    .digest("hex");

  try {
    let user = await User.findOne({
      otpToken: otpToken,
      otpTokenExpire: { $gt: Date.now() },
    });

    if (user) {
      user.otpToken = undefined;
      user.otpTokenExpire = undefined;
      user = await user.save();

      sendToken(user, 200, res);
    } else {
      return next(new ErrorResponse("No user Found!", 400));
    }
    if (!user) {
      return next(new ErrorResponse(MESSAGE.CREDENTIALS_ERROR, 401));
    }
  } catch (err) {
    return next(new ErrorResponse(err, 400));
  }
};

// @desc    Register user
exports.register = async (req, res, next) => {
  const {
    firstName,
    lastName,
    email,
    password,
    referralCode = undefined,
    userRole,
    // fcmApp,
    // socialConnect,
    // username,
  } = req.body;
  try {
    // console.log(socialConnect);
    const user = await User.create({
      firstName,
      lastName,
      email: email.toLowerCase(),
      // fcmApp,
      // username,
      userRole,
      password,
      // socialConnect,
    });

    if (user) {
      emailVerify(user, 201, res, "Instruction are sent to the Email");
    }
  } catch (err) {
    return next(new ErrorResponse(err, 400));
  }
};
// @desc    Forgot Password Initialization
// exports.forgotPassword = async (req, res, next) => {
//   // Send Email to email provided but first check if user exists
//   const { email } = req.body;
//   try {
//     const user = await User.findOne({ email, dataStatus: "active" });
//     if (!user) {
//       return next(new ErrorResponse(MESSAGE.EMAIL_SENT_ERROR, 404));
//     }
//     // Reset Token Gen and add to database hashed (private) version of token
//     const resetToken = user.getResetPasswordToken();
//     await user.save();
//     // Create reset url to email to provided email

//     // HTML Message
//     const message = `
//      <!DOCTYPE html>
// <html lang="en">
//   <head>
//     <meta charset="UTF-8" />
//     <meta http-equiv="X-UA-Compatible" content="IE=edge" />
//     <meta name="viewport" content="width=device-width, initial-scale=1.0" />
//     <link rel="preconnect" href="https://fonts.googleapis.com" />
//     <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
//     <link
//       href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,400;0,700;1,300&display=swap"
//       rel="stylesheet"
//     />
//     <style>
//       *,
//       *::before,
//       *::after {
//         margin: 0;
//         padding: 0;
//       }
//       body {
//         font-family: "Roboto", sans-serif;
//         font-weight: 400;
//         background-color: #fff;
//         line-height: 1.3;
//         display: flex;
//         justify-content: center;
//         align-items: center;
//         height: 100vh;
//       }
//       .container {
//         max-width: 600px;
//         margin: 0 auto;
//       }
//       .mb-20 {
//         margin-bottom: 20px;
//       }
//       .greetings {
//         text-align: center;
//       }
//       .heading-tertiary {
//         margin-top: 8px;
//         margin-bottom: 16px;
//         color: #1e1e1e;
//         font-weight: bold !important;
//         font-family: "Axia", sans-serif;
//         line-height: 1.4em;
//       }
//       .f-56 {
//         font-size: clamp(28px, 3.86vw, 56px);
//       }
//       .f-45 {
//         font-size: clamp(22px, 3vw, 45px) !important;
//       }
//       .f-30 {
//         font-size: clamp(20px, 2.3vw, 30px) !important;
//       }
//       .f-20 {
//         font-size: clamp(14px, 1.38vw, 20px);
//       }
//       .f-18 {
//         font-size: clamp(12px, 1.24vw, 18px);
//       }
//       .f-24 {
//         font-size: clamp(16px, 1.66vw, 24px) !important;
//       }
//       .f-18 {
//         font-size: clamp(12px, 1.24vw, 18px) !important;
//       }
//       .container {
//         border: 1px solid #eee;
//       }
//       .pointapp {
//         padding: 0px;
//       }
//       .need-help-text {
//         text-align: center;
//       }
//       .pointapp_header {
//         background-color: #fff;
//         display: flex;
//         justify-content: center;
//         z-index: 0;
//       }
//       .pointapp-container {
//         max-width: 700px;
//         margin: 0 auto;
//         padding-bottom: 0px;
//         padding: 20px;
//       }
//       .pointapp_header img {
//         width: 100%;
//       }
//       .pointapp_body {
//         padding: 28px 32px;
//         background-color: #ffffff;
//         margin-top: -100px;
//         z-index: 99;
//         border: 1px solid #e0e0e0;
//         box-shadow: 0 3px 15px #0000001a;
//         position: relative;
//       }
//       .pointapp_body p {
//         font-size: clamp(14px, 1.38vw, 16px) !important;
//       }
//       .h-primary {
//         color: #0f0f0f;
//         font-weight: 600;
//         text-align: left;
//         margin-bottom: 22px;
//       }
//       h1 {
//         text-align: center;
//       }
//       .pointapp-card {
//       }
//       .btn {
//         background-color: #5c83ea;
//         color: #fff;
//         padding: 14px 24px;
//         text-align: center;
//         border: 0;
//         box-shadow: 0 3px 8px #26262641;
//       }
//       .btn-box {
//         text-align: center;
//         margin: 32px 0;
//       }
//       .btn--confirm {
//       }
//       .text {
//         text-align: left;
//       }
//       .password {
//         padding: 12px 0 18px 0;
//         color: #ba4d3e !important;
//         font-weight: 400;
//       }
//       .cheers {
//         margin-top: 38px;
//         margin-bottom: 4px;
//         color: #484848;
//       }
//       .h-secondary {
//         color: #000000;
//         font-weight: 400;
//       }
//       .help {
//         background-color: #5c83ea33;
//         padding: 18px 0;
//         text-align: center;
//         max-width: 600px;
//         margin: 0 auto;
//       }
//       .help p {
//         color: #000000;
//         margin-bottom: 3px;
//       }
//       .pointapp-label {
//         font-size: clamp(14px, 1.38vw, 20px) !important;
//         font-weight: 600;
//       }
//       .text-color {
//         color: #449f45;
//       }
//       .dashboard {
//         padding-left: 50px;
//         color: #000000;
//       }
//       .copyright {
//         color: #484848;
//         margin-top: 25px;
//         text-align: center;
//         font-size: clamp(14px, 1.38vw, 16px) !important;
//       }
//       .bg-color {
//         background: #ebf7eb;
//       }
//       .bg-color p {
//         padding: 20px 30px;
//       }
//       @media (max-width: 767px) {
//         .container {
//           width: 100%;
//         }
//         .copyright {
//           margin-top: 24px;
//         }
//       }
//     </style>
//     <title>Email Template</title>
//   </head>
//   <body>
//     <div className="container">
//       <section className="pointapp">
//         <div className="pointapp_header">
//           <img src="http://pointapp.pixarsclients.com/img/email/bg.png" alt="" />
//         </div>
//         <div className="pointapp-container">
//           <div className="pointapp_body mb-20">
//             <div className="pointapp-card">
//                <div className="pointApp-inner-wrapper mb-20">
//                 <h1 className="f-30 fw-normal mb-20">Welcome!</h1>
//                 <p className="text mb-20">You have requested to create account</p>
//                 <p>Please  copy the following Code below to active your account and code will be expired in 10min :</p>
//                <p> ${resetToken}</p>
//               </div>
//             </div>
//           </div>
//           <div className="bg-color">
//             <p className="greetings">
//               Thank you for your registration. If you have any questions, please
//               reach out to us at
//               <a href="mailto:support@dockTok.com" className="text-color">
//                 support@dockTok.com</a
//               >, or contact your assigned contact manager.
//             </p>
//           </div>
//           <div className="billing">
//             <p className="copyright">
//               Copyright &copy; Point Pickleball LLC, All Rights Reserved
//             </p>
//           </div>
//         </div>
//       </section>
//     </div>
//   </body>
// </html>
//     `;
//     try {
//       await sendEmail({
//         to: user.email,
//         subject: "Password Reset Request",
//         text: message,
//       });
//       res.status(200).json({ success: true, message: MESSAGE.EMAIL_SENT });
//     } catch (err) {
//       user.resetPasswordToken = undefined;
//       user.resetPasswordExpire = undefined;
//       await user.save();
//       return next(new ErrorResponse(MESSAGE.EMAIL_SENT_ERROR, 500));
//     }
//   } catch (err) {
//     return next(new ErrorResponse(err, 400));
//   }
// };

// @desc  Sent  Reset  Password Mail
exports.resetPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return next(new ErrorResponse(MESSAGE.USER_NOT_FOUND, 404));
    }

    resetEmail(user, 200, res, MESSAGE.EMAIL_SENT);
  } catch (err) {
    return next(new ErrorResponse(err, 400));
  }
};

const resetEmail = async (user, statusCode, res) => {
  const verifyresetToken = user.getResetPasswordToken();

  await user.save();
  const template = await Email.findOne({
    type: "PASSWORD_RESET",
  });
  if (template !== null) {
    let str = template.content.replace(/@\{code\}/g, verifyresetToken);
    if (str.includes("@{firstName}")) {
      str = str.replace(/@\{firstName\}/g, user.firstName);
    }
    if (str.includes("@{lastName}")) {
      str = str.replace(/@\{lastName\}/g, user.lastName);
    }
  }

  const values = {
    user: user.firstName,
    header: "RESET PASSWORD",
    content: `Your DockTok Account Reset Password code is ${verifyresetToken}`,
    btnLink: process.env.RESET_PASSWORD_PAGE,
    btnText: "Reset Code",
  };
  let message = mail(values);

  sendEmail({
    to: user.email,
    subject: template ? template.subject : "Reset Password",
    text: message,
  });
  return res.status(statusCode).json({
    success: true,
    message: `${MESSAGE.EMAIL_RESET_PASSWORD}`,
  });
};

exports.verifyResetPassword = async (req, res, next) => {
  // Compare token in URL params to hashed token
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.body.resetToken)
    .digest("hex");
  try {
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });
    if (!user) {
      return next(new ErrorResponse(MESSAGE.TOKEN_ERROR, 400));
    }
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    res.status(201).json({
      success: true,
      message: MESSAGE.PASSWORD_UPDATE_SUCCESS,
      token: user.getSignedJwtToken(process.env.JWT_EXPIRE),
    });
  } catch (err) {
    return next(new ErrorResponse(err, 400));
  }
};

const sendToken = async (user, statusCode, res) => {
  const token = user.getSignedJwtToken(process.env.JWT_EXPIRE);
  user.password = undefined;
  createLog(user);
  res.status(statusCode).json({ success: true, token, data: user });
};
exports.verify = (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      data: {
        _id: req.user._id,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        email: req.user.email,
        userRole: req.user.userRole,
        referral: req.user.referral,
        additionalInfo: req.user.additionalInfo,
        emailVerified: req.user.emailVerified,
        fcmAndroidApp: req.user.fcmAndroidApp,
      },
    });
  } catch (e) {
    next(e);
  }
};

exports.sendMailTesting = async (req, res, next) => {
  try {
    const { message, email } = req.body;
    await sendEmail({
      to: email,
      subject: "Password Reset Request",
      text: message,
    });
    res.status(200).json({
      success: true,
    });
  } catch (e) {
    next(e);
  }
};
// @desc    Email Verification Code
exports.emailVerifyCode = async (req, res, next) => {
  // Compare token in URL params to hashed token
  const verifyEmailToken = crypto
    .createHash("sha256")
    .update(req.body.code)
    .digest("hex");
  try {
    let user = await User.findOne({
      verifyEmailToken,
      verifyEmailTokenExpire: { $gt: Date.now() },
    });
    if (!user) {
      const user = await User.findOne({
        verifyEmailToken,
      });
      if (user) {
        emailVerify(user, 400, res, MESSAGE.EMAIL_VERIFICATION_TOKEN_ERROR);
      }
      return next(
        new ErrorResponse(MESSAGE.EMAIL_VERIFICATION_TOKEN_ERROR, 400),
      );
    }
    user.emailVerified = true;
    user.verifyEmailToken = undefined;
    user.verifyEmailTokenExpire = undefined;
    user = await user.save();
    // sendToken(user, 200, res);
    return res.status(200).json({
      success: true,
      message: MESSAGE.EMAIL_VERIFICATION_SUCCESS,
    });
  } catch (err) {
    return next(new ErrorResponse(err, 400));
  }
};
const emailVerify = async (user, statusCode, res, rsp) => {
  const verifyEmailToken = user.getEmailVerifyToken();
  await user.save();
  const template = await Email.findOne({
    type: "EMAIL_VERIFICATION",
  });
  let message;
  if (template !== null) {
    let str = template.content.replace(/@\{code\}/g, verifyEmailToken);
    if (str.includes("@{firstName}")) {
      str = str.replace(/@\{firstName\}/g, user.firstName);
    }
    if (str.includes("@{lastName}")) {
      str = str.replace(/@\{lastName\}/g, user.lastName);
    }
  }
  const values = {
    user: user.firstName,
    header: "Email VERIFICATION",
    content: `You are now part of the Docktok Your Email Verfication Code is ${verifyEmailToken} GO and post Videos`,
    btnLink: process.env.LOGIN_PAGE,
    btnText: "Visit Site",
  };
  message = mail(values);

  sendEmail({
    to: user.email,
    subject: template ? template.subject : "Email Verification",
    text: message,
  });
  return res.status(statusCode).json({
    success: true,
    message: `${rsp}`,
  });
};
exports.resendEmailVerification = async (req, res, next) => {
  const { email } = req.body;
  // Check if email and password is provided
  if (!email) {
    return next(new ErrorResponse(MESSAGE.EMAIL_ERROR, 400));
  }
  try {
    // Check that user exists by email
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return next(new ErrorResponse(MESSAGE.CREDENTIALS_ERROR, 401));
    }
    if (user.emailVerified == false) {
      checkError = true;
      return emailVerify(user, 200, res, MESSAGE.EMAIL_VERIFICATION_SENT);
      // return next(new ErrorResponse("E-mail is not verified", 401));
    }
    return next(new ErrorResponse(MESSAGE.CREDENTIALS_ERROR, 401));
    // Check that password match
  } catch (err) {
    return next(new ErrorResponse(err, 400));
  }
};

// logout
exports.logout = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { fcmAndroidApp: null },
      { new: true },
    );
    res.status(200).json({
      success: true,
      message: MESSAGE.LOGOUT,
    });
  } catch (err) {
    return next(new ErrorResponse(err, 400));
  }
};
