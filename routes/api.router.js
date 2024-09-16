const express = require("express");
const { getApi } = require("../controllers/api.controllers");

const apiRouter = express.Router();

apiRouter.get("/", getApi);

module.exports = apiRouter;
