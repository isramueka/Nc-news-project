const { deleteCommentById } = require("../models/comments.models");
const { updateCommentVotes } = require("../models/comments.models");

const deleteComment = (req, res, next) => {
  const { comment_id } = req.params;
  deleteCommentById(comment_id)
    .then(() => {
      res.sendStatus(204);
    })
    .catch((err) => {
      next(err);
    });
};

const patchVotesForComment = (req, res, next) => {
  const { comment_id } = req.params;
  const { inc_votes } = req.body;

  if (typeof inc_votes !== "number") {
    return res.status(400).send({ msg: "Invalid input for votes" });
  }

  updateCommentVotes(comment_id, inc_votes)
    .then((comment) => {
      res.status(200).send({ comment });
    })
    .catch((err) => {
      next(err);
    });
};

module.exports = { deleteComment, patchVotesForComment };
