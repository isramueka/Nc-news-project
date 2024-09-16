const db = require("../db/connection");

const fetchTopics = () => {
  return db.query("SELECT * FROM topics;").then(({ rows }) => {
    return rows;
  });
};

const fetchValidTopics = () => {
  return db.query("SELECT slug FROM topics").then((result) => {
    return result.rows.map((row) => row.slug);
  });
};

const insertTopic = (slug, description) => {
  if (!slug || !description) {
    return Promise.reject({
      status: 400,
      msg: "Missing required fields: slug and description",
    });
  }

  return db
    .query(
      `INSERT INTO topics (slug, description) 
     VALUES ($1, $2) 
     RETURNING *`,
      [slug, description]
    )
    .then(({ rows }) => {
      return rows[0];
    });
};

module.exports = { fetchTopics, fetchValidTopics, insertTopic };
