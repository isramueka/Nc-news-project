const db = require("../db/connection");

const fetchUsers = () => {
  return db.query("SELECT * FROM users").then(({ rows }) => {
    return rows;
  });
};

module.exports = { fetchUsers };
