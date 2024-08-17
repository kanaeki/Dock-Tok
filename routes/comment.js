const express = require("express");
const {
  getComment,
  createComment,
  deleteComment,
  updateComment,
} = require("../controllers/Comment/Comment");
const { protect } = require("../middleware/auth");
const router = express.Router();

router.route("/").post(protect, createComment);
router.route("/:id").get(protect, getComment);
router
  .route("/:commentId")
  .delete(protect, deleteComment)
  .put(protect, updateComment);

module.exports = router;
