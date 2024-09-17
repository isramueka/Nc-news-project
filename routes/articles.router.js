const express = require("express");
const {
  getArticleById,
  getArticles,
  getCommentsByArticle,
  postCommentForArticle,
  patchVotesForArticle,
  postArticle,
  deleteArticle,
} = require("../controllers/articles.controllers");

const articlesRouter = express.Router();

articlesRouter.get("/", getArticles).post("/", postArticle);
articlesRouter.get("/:article_id", getArticleById);
articlesRouter.get("/:article_id/comments", getCommentsByArticle);
articlesRouter.post("/:article_id/comments", postCommentForArticle);
articlesRouter.patch("/:article_id", patchVotesForArticle);
articlesRouter.delete("/:article_id", deleteArticle);

module.exports = articlesRouter;
