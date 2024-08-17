const express = require("express");
const { adminProtect } = require("../middleware/auth");
const {
  createTemplate,
  getAlltemplates,
  updateTemplate,
  getTemplate,
  deleteTemplate,
} = require("../controllers/EmailMangement/email");

const router = express.Router();

router.route("/").post(adminProtect, createTemplate).get(getAlltemplates);

router
  .route("/:id")
  .get(getTemplate)
  .put(adminProtect, updateTemplate)
  .delete(deleteTemplate);

module.exports = router;
