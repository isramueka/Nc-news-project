const db = require("../db/connection");
const { fetchValidTopics } = require("./topics.models");

const fetchArticleById = (article_id) => {
  return db
    .query(
      `
    SELECT articles.*, COUNT(comments.comment_id)::integer AS comments_count
    FROM articles
    LEFT JOIN comments ON comments.article_id = articles.article_id
    WHERE articles.article_id = $1
    GROUP BY articles.article_id
  `,
      [article_id]
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

const fetchArticles = (
  sort_by = "created_at",
  order = "desc",
  topic,
  limit = 10,
  p = 1
) => {
  const validSortColumns = [
    "title",
    "author",
    "created_at",
    "votes",
    "article_id",
    "comments_count",
  ];
  const validOrderValues = ["asc", "desc"];
  // Validate sort_by
  if (!validSortColumns.includes(sort_by)) {
    return Promise.reject({
      status: 400,
      msg: "Invalid sort_by column",
    });
  }
  // Validate order
  if (!validOrderValues.includes(order)) {
    return Promise.reject({
      status: 400,
      msg: "Invalid order value",
    });
  }
  // Validate limit and page
  if (isNaN(limit) || limit <= 0) {
    return Promise.reject({
      status: 400,
      msg: "Invalid limit value",
    });
  }
  if (isNaN(p) || p <= 0) {
    return Promise.reject({
      status: 400,
      msg: "Invalid page value",
    });
  }

  // Calculate the starting point
  const offset = (p - 1) * limit;

  return fetchValidTopics().then((validTopics) => {
    if (topic && !validTopics.includes(topic)) {
      return Promise.reject({ status: 404, msg: "Invalid topic value" });
    }

    // Build the SQL query with optional topic filter
    let queryStr = `
    SELECT articles.author, articles.title, articles.article_id, articles.topic, articles.created_at, articles.votes, articles.article_img_url,
    COUNT(comments.comment_id)::integer AS comments_count
    FROM articles
    LEFT JOIN comments ON comments.article_id = articles.article_id
  `;

    const queryParams = [];

    if (topic) {
      queryStr += ` WHERE articles.topic = $1`;
      queryParams.push(topic);
    }

    queryStr += ` GROUP BY articles.article_id ORDER BY ${sort_by} ${order} LIMIT $${
      queryParams.length + 1
    } OFFSET $${queryParams.length + 2}`;

    queryParams.push(limit, offset);

    return db.query(queryStr, queryParams).then(({ rows }) => {
      return db
        .query(
          "SELECT COUNT(*) FROM articles" + (topic ? " WHERE topic = $1" : ""),
          topic ? [topic] : []
        )
        .then(({ rows: [{ count }] }) => {
          return { articles: rows, total_count: parseInt(count, 10) };
        });
    });
  });
};

const fetchCommentsByArticle = (article_id, limit, p) => {
  const offset = (p - 1) * limit;

  return db
    .query(`SELECT * FROM articles WHERE article_id = $1`, [article_id])
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({
          status: 404,
          msg: "No comments found for this article",
        });
      }

      // Get the total count of comments
      const totalCountQuery = db.query(
        `SELECT COUNT(*)::int AS total_count FROM comments WHERE article_id = $1`,
        [article_id]
      );

      // Get the comments with pagination
      const commentsQuery = db.query(
        `SELECT comment_id, votes, created_at, author, body, article_id
        FROM comments
        WHERE article_id = $1
        ORDER BY created_at DESC
        LIMIT $2 OFFSET $3`,
        [article_id, limit, offset]
      );

      return Promise.all([totalCountQuery, commentsQuery]);
    })
    .then(([totalCountResult, commentsResult]) => {
      const total_count = totalCountResult.rows[0].total_count;
      const comments = commentsResult.rows;
      return { comments, total_count };
    });
};

const postComment = (article_id, username, body) => {
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

const insertArticle = (author, title, body, topic, article_img_url) => {
  if (!author || !title || !body || !topic) {
    return Promise.reject({
      status: 400,
      msg: "Missing required fields: author, title, body, topic and article_img_url",
    });
  }

  // Check if author exists
  return db
    .query(`SELECT * FROM users WHERE username = $1`, [author])
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({
          status: 404,
          msg: "Author not found",
        });
      }
      // Check if topic exists
      return db.query(`SELECT * FROM topics WHERE slug = $1`, [topic]);
    })
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({
          status: 404,
          msg: "Topic not found",
        });
      }
      // Insert the article if validation passes
      return db.query(
        `INSERT INTO articles (author, title, body, topic, article_img_url, created_at)
         VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
         RETURNING *, 0 AS comment_count`,
        [author, title, body, topic, article_img_url]
      );
    })
    .then(({ rows }) => {
      return rows[0];
    });
};

module.exports = {
  fetchArticleById,
  fetchArticles,
  fetchCommentsByArticle,
  postComment,
  updateVotesForArticle,
  insertArticle,
};
