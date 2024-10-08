const {
  fetchArticleById,
  fetchArticles,
  fetchCommentsByArticle,
  postComment,
  updateVotesForArticle,
  insertArticle,
  removeArticle,
  removeCommentsByArticleId,
} = require("../models/articles.models");

const getArticleById = (req, res, next) => {
  const { article_id } = req.params;
  fetchArticleById(article_id)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch((err) => {
      next(err);
    });
};

const getArticles = (req, res, next) => {
  const { sort_by, order, topic, limit = 10, p = 1 } = req.query;
  fetchArticles(sort_by, order, topic, limit, p)
    .then(({ articles, total_count }) => {
      res.status(200).send({ articles, total_count });
    })
    .catch((err) => {
      next(err);
    });
};

const getCommentsByArticle = (req, res, next) => {
  const { article_id } = req.params;
  const { limit = 10, p = 1 } = req.query;
  fetchCommentsByArticle(article_id, limit, p)
    .then(({ comments, total_count }) => {
      res.status(200).send({ comments, total_count });
    })
    .catch((err) => {
      next(err);
    });
};

const postCommentForArticle = (req, res, next) => {
  const { article_id } = req.params;
  const { username, body } = req.body;
  postComment(article_id, username, body)
    .then((comment) => {
      res.status(201).send({ comment });
    })
    .catch((err) => {
      next(err);
    });
};

const patchVotesForArticle = (req, res, next) => {
  const { article_id } = req.params;
  const { upd_votes } = req.body;
  updateVotesForArticle(article_id, upd_votes)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch((err) => {
      next(err);
    });
};

const postArticle = (req, res, next) => {
  const { author, title, body, topic, article_img_url } = req.body;
  insertArticle(author, title, body, topic, article_img_url)
    .then((newArticle) => {
      res.status(201).send({ article: newArticle });
    })
    .catch((err) => {
      next(err);
    });
};

const deleteArticle = (req, res, next) => {
  const { article_id } = req.params;
  removeCommentsByArticleId(article_id)
    .then(() => removeArticle(article_id))
    .then(() => {
      res.status(204).send();
    })
    .catch(next);
};

module.exports = {
  getArticleById,
  getArticles,
  getCommentsByArticle,
  postCommentForArticle,
  patchVotesForArticle,
  postArticle,
  deleteArticle,
};
