const fs = require("fs").promises;

const getApi = (req, res, next) => {
  const filePath = `${__dirname}/../endpoints.json`;

  fs.readFile(filePath, "utf-8")
    .then((data) => {
      const endpoints = JSON.parse(data);
      res.status(200).send({ endpoints });
    })
    .catch(next);
};

module.exports = { getApi };
