const { fetchTopics } = require("../models/topics.models");

const getTopics = (req, res, next) => {
  fetchTopics()
    .then((topics) => {
      res.status(200).send({ topics });
    })
    .catch((err) => {
      if (err) {
        res.status(500).send({ msg: "Internal Server Error" });
      }
    });
};

module.exports = { getTopics };
