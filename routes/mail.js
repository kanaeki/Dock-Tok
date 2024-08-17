const express = require("express");
const { adminProtect, protect } = require("../middleware/auth");
const {
  createMailUser,
  getAllMails,
  getMailUser,
  delUser,
} = require("../controllers/MailManagement/mail");

const router = express.Router();

router.route("/").post(protect, createMailUser).get(adminProtect, getAllMails);

router.route("/unsubscribe").get(delUser);

router.route("/:id").get(adminProtect, getMailUser);

module.exports = router;
