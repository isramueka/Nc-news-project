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

module.exports = { fetchTopics, fetchValidTopics };
