const mongoose = require("mongoose");

const emailSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: [
        "WELCOME",
        "EMAIL_VERIFICATION",
        "PASSWORD_RESET",
        "2FA_AUTHENTICATION",
      ],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    modifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);

const Email = mongoose.model("Email", emailSchema);
module.exports = Email;
