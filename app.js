const express = require("express");
const { getTopics } = require("./controllers/topics.controllers");
const { getApi } = require("./controllers/api.controllers");
const { getArticleById } = require("./controllers/articles.controllers");
const { getArticles } = require("./controllers/articles.controllers");
const { getCommentsByArticle } = require("./controllers/articles.controllers");
const app = express();

app.get("/api", getApi);

app.get("/api/topics", getTopics);

app.get("/api/articles", getArticles);

app.get("/api/articles/:article_id", getArticleById);

app.get("/api/articles/:article_id/comments", getCommentsByArticle);

// Refactored Middleware to handle custom errors as requested in (PR#4)
app.use((err, req, res, next) => {
  if (err.status && err.msg) {
    return res.status(err.status).send({ msg: err.msg });
  }
  next(err);
});

app.use((err, req, res, next) => {
  if (err.code === "22P02") {
    return res.status(400).send({ msg: "Invalid input" });
  }
  next(err);
});

//Refactor of err truthy, as it can handle any error
app.use((err, req, res, next) => {
  if (err.status) {
    res.status(err.status).send({ msg: err.msg });
  } else {
    res.status(500).send({ msg: "Internal Server Error" });
  }
});

module.exports = app;
