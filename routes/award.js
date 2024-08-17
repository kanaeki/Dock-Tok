const express = require("express");
const {
  addAward,
  getallAwards,
  updateAward,
  deleteAward,
  getSingleAward,
} = require("../controllers/Award/award");
const { adminProtect } = require("../middleware/auth");

const router = express.Router();

router.route("/").post(adminProtect, addAward).get(getallAwards);

router
  .route("/:id")
  .get(adminProtect, getSingleAward)
  .put(adminProtect, updateAward)
  .delete(adminProtect, deleteAward);

module.exports = router;
