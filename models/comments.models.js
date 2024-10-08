const db = require("../db/connection");

const deleteCommentById = (comment_id) => {
  return db
    .query("DELETE FROM comments WHERE comment_id = $1 RETURNING *;", [
      comment_id,
    ])
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({
          status: 404,
          msg: "Comment Not Found",
        });
      }
    });
};

const updateCommentVotes = (comment_id, inc_votes) => {
  return db
    .query(
      "UPDATE comments SET votes = votes + $2 WHERE comment_id = $1 RETURNING *;",
      [comment_id, inc_votes]
    )
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({
          status: 404,
          msg: "Comment Not Found",
        });
      }
      return rows[0];
    });
};

module.exports = {
  deleteCommentById,
  updateCommentVotes,
};
