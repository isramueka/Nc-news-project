const db = require("../db/connection");

const fetchArticleById = (article_id) => {
  return db
    .query(`SELECT * FROM articles WHERE article_id = $1`, [article_id])
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({
          status: 404,
          msg: "Article Not Found",
        });
      }
      return rows[0];
    });
};

const fetchArticles = () => {
  // Exclude Body property not selecting *, LEFT JOIN to select articles with no comments. Use ::integer to not have a String as a COUNT
  return db
    .query(
      `SELECT articles.author, articles.title, articles.article_id, articles.topic, articles.created_at, articles.votes, articles.article_img_url,
  COUNT (comments.comment_id)::integer AS comments_count
  FROM articles
  LEFT JOIN comments ON comments.article_id = articles.article_id
  GROUP BY articles.article_id
  ORDER BY articles.created_at DESC`
    )
    .then(({ rows }) => {
      return rows;
    });
};

const fetchCommentsByArticle = (article_id) => {
  return db
    .query(`SELECT * FROM articles WHERE article_id = $1`, [article_id])
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({
          status: 404,
          msg: "No comments found for this article",
        });
      }
      return db.query(
        `SELECT comment_id, votes, created_at, author, body, article_id
        FROM comments
        WHERE article_id = $1
        ORDER BY created_at DESC`,
        [article_id]
      );
    })
    .then(({ rows }) => {
      return rows;
    });
};

const postComment = (article_id, username, body) => {
  // Validate input in the model as requested in (PR#6)
  if (!username || !body) {
    return Promise.reject({
      status: 400,
      msg: "Missing required fields: username and body",
    });
  }

  return db
    .query(`SELECT * FROM users WHERE username = $1`, [username])
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({
          status: 404,
          msg: "Username not found",
        });
      }
      // Check if article exists
      return db.query(`SELECT * FROM articles WHERE article_id = $1`, [
        article_id,
      ]);
    })
    .then(({ rows }) => {
      if (rows.length === 0) {
        // Article not found
        return Promise.reject({
          status: 404,
          msg: `Article not found for id: ${article_id}`,
        });
      }
      // Insert the comment if both passed
      return db.query(
        `INSERT INTO comments (article_id, author, body, created_at)
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
       RETURNING *`,
        [article_id, username, body]
      );
    })
    .then(({ rows }) => {
      return rows[0];
    });
};

const updateVotesForArticle = (article_id, upd_votes) => {
  return db
    .query(
      `UPDATE articles
       SET votes = votes + $2
       WHERE article_id = $1
       RETURNING *`,
      [article_id, upd_votes]
    )
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({
          status: 404,
          msg: "Article Not Found",
        });
      }
      return rows[0];
    });
};

module.exports = {
  fetchArticleById,
  fetchArticles,
  fetchCommentsByArticle,
  postComment,
  updateVotesForArticle,
};
