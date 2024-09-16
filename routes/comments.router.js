const express = require("express");
const { deleteComment } = require("../controllers/comments.controllers");
const { patchVotesForComment } = require("../controllers/comments.controllers");

const commentsRouter = express.Router();

commentsRouter.delete("/:comment_id", deleteComment);
commentsRouter.patch("/:comment_id", patchVotesForComment);

module.exports = commentsRouter;
