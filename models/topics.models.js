const db = require("../db/connection");

const fetchTopics = () => {
  return db.query("SELECT * FROM topics;").then(({ rows }) => {
    return rows;
  });
};

module.exports = { fetchTopics };
