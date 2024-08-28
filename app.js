const express = require("express");
const { getTopics } = require("./controllers/topics.controllers");
const { getApi } = require("./controllers/api.controllers");
const app = express();

app.use(express.json());

app.get("/api", getApi);

app.get("/api/topics", getTopics);

app.use((err, req, res, next) => {
  res.status(500).send({ msg: "Internal Server Error" });
});

module.exports = app;
