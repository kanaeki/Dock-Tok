const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const uniqueValidator = require("mongoose-unique-validator");
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const randomize = require("randomatic");
const UserSchema = new mongoose.Schema(
  {
    firstName: { type: String },
    lastName: { type: String },
    username: {
      type: String,
      // required: [true, 'Please provide username'],
      // unique: true,
      text: true,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        default: [0, 0],
      },
    },
    fcmApp: { type: String },
    userRole: {
      type: String,
      enum: ["subscriber", "admin", "staff"],
      default: "subscriber",
    },
    additionalInfo: {
      assignRole: { type: String },
      profileViewCounter: { type: Number, default: 0 },
      profileImage: { type: String },
      phoneNumber: { type: String },
      tagLine: {
        type: String,
        minlength: 0, // Minimum length of 2 characters
        maxlength: 120, // Maximum length of 50 characters
      },
      gender: { type: String },
      location: { type: Object },
      dateOfBirth: { type: Date },
      mailingAddress: { type: String },
    },
    email: {
      type: String,
      required: [true, "Please provide email address"],
      unique: true,
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        "Please provide a valid email",
      ],
    },
    emailVerified: { type: Boolean, default: false },
    password: {
      type: String,

      minlength: 6,
      select: false,
    },
    firebase: {
      firebase_id: { type: String },
      providerData: [{ type: Object }],
      refreshToken: { type: String },
      token: { type: String },
    },
    socialConnect: {
      facebook: {
        accessToken: { type: String },
        data_access_expiration_time: { type: String },
        email: { type: String },
        expiresIn: { type: String },
        graphDomain: { type: String },
        id: { type: String },
        name: { type: String },
        picture: { type: Object },
        signedRequest: { type: String },
        UserID: { type: String },
      },
      google: {
        access_token: { type: String },
        expiry_date: { type: String },
        id_token: { type: String },
        refresh_token: { type: String },
        graphDomain: { type: String },
        scope: { type: String },
        token_type: { type: String },
      },
      instagram: {
        access_token: { type: String },
      },
      tiktok: {
        access_token: { type: String },
      },
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    modifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    dataStatus: { type: String, default: "active" },
    blockedUser: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    resetPasswordToken: String,
    resetPasswordExpire: Date,
    verifyEmailToken: String,
    verifyEmailTokenExpire: Date,
    otpToken: String,
    otpTokenExpire: Date,
  },
  {
    timestamps: true,
  },
);
UserSchema.index({ location: "2dsphere" });
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});
UserSchema.methods.passwordUpdate = async function (password) {
  const salt = await bcrypt.genSalt(10);
  password = await bcrypt.hash(password, salt);

  return password;
};
UserSchema.methods.matchPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};
UserSchema.methods.getSignedJwtToken = function (expire = 0) {
  return jwt.sign(
    {
      id: this._id,
      userRole: this.userRole,
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
    },
    process.env.JWT_SECRET_KEY,
    {
      expiresIn: expire == 0 ? expire : process.env.JWT_EXPIRE,
    },
  );
};
UserSchema.methods.getResetPasswordToken = function () {
  const resetToken = randomize("A0", 6);
  // Hash token (private key) and save to database
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  // Set token expire date
  this.resetPasswordExpire = Date.now() + 10 * (60 * 1000); // Ten Minutes
  return resetToken;
};
UserSchema.methods.getEmailVerifyToken = function () {
  const emailVerifyToken = randomize("A0", 6);
  // Hash token (private key) and save to database
  this.verifyEmailToken = crypto
    .createHash("sha256")
    .update(emailVerifyToken)
    .digest("hex");
  // Set token expire date
  this.verifyEmailTokenExpire = Date.now() + 3 * (60 * 1000); // Three Minutes
  return emailVerifyToken;
};

UserSchema.methods.generateOtpToken = function () {
  const otpToken = randomize("A0", 8);
  this.otpToken = crypto.createHash("sha256").update(otpToken).digest("hex");
  this.otpTokenExpire = Date.now() + 1 * 60 * 1000; //Three Minutes
  return otpToken;
};
UserSchema.plugin(uniqueValidator, {
  message: "expected {VALUE} to be unique.",
});
UserSchema.plugin(aggregatePaginate);
// UserSchema.plugin(uniqueValidator, {
//   name: 'test',
//   message: 'expected {PATH}:({VALUE}) to be unique.',
// });
const User = mongoose.model("User", UserSchema);
module.exports = User;
