const express = require("express");
const {
  getArticleById,
  getArticles,
  getCommentsByArticle,
  postCommentForArticle,
  patchVotesForArticle,
  postArticle,
} = require("../controllers/articles.controllers");

const articlesRouter = express.Router();

articlesRouter.get("/", getArticles).post("/", postArticle);
articlesRouter.get("/:article_id", getArticleById);
articlesRouter.get("/:article_id/comments", getCommentsByArticle);
articlesRouter.post("/:article_id/comments", postCommentForArticle);
articlesRouter.patch("/:article_id", patchVotesForArticle);

module.exports = articlesRouter;
