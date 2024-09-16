const express = require("express");
const apiRouter = require("./routes/api.router");
const topicsRouter = require("./routes/topics.router");
const articlesRouter = require("./routes/articles.router");
const commentsRouter = require("./routes/comments.router");
const usersRouter = require("./routes/users.router");
const app = express();

app.use(express.json());

// Use of Router to get routes
app.use("/api", apiRouter);
app.use("/api/topics", topicsRouter);
app.use("/api/articles", articlesRouter);
app.use("/api/comments", commentsRouter);
app.use("/api/users", usersRouter);

app.use((err, req, res, next) => {
  if (err.status && err.msg) {
    console.log(err);
    return res.status(err.status).send({ msg: err.msg });
  } else if (err.code === "22P02") {
    return res.status(400).send({ msg: "Invalid input" });
  } else if (err.code === "23502") {
    return res.status(400).send({ msg: "Missing required field" });
  }
  next(err);
});

app.use((err, req, res, next) => {
  res.status(500).send({ msg: "Internal Server Error" });
});

module.exports = app;
