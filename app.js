const express = require("express");
const { getTopics } = require("./controllers/topics.controllers");
const { getApi } = require("./controllers/api.controllers");
const {
  getArticleById,
  getArticles,
  getCommentsByArticle,
  postCommentForArticle,
  patchVotesForArticle,
} = require("./controllers/articles.controllers");
const { deleteComment } = require("./controllers/comments.controllers");
const { getUsers } = require("./controllers/users.controllers");
const app = express();

app.use(express.json());

app.get("/api", getApi);

app.get("/api/topics", getTopics);

app.get("/api/articles", getArticles);

app.get("/api/articles/:article_id", getArticleById);

app.get("/api/articles/:article_id/comments", getCommentsByArticle);

app.post("/api/articles/:article_id/comments", postCommentForArticle);

app.patch("/api/articles/:article_id", patchVotesForArticle);

app.delete("/api/comments/:comment_id", deleteComment);

app.get("/api/users", getUsers);

// Refactor (PR#5) for consolidated error handler for custom and validation errors
app.use((err, req, res, next) => {
  if (err.status && err.msg) {
    return res.status(err.status).send({ msg: err.msg });
  } else if (err.code === "22P02") {
    return res.status(400).send({ msg: "Invalid input" });
  }
  next(err);
});

// Catch-all error handler for unexpected errors
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send({ msg: "Internal Server Error" });
});

module.exports = app;
