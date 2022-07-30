const serverless = require("serverless-http");
const express = require("express");
const app = express();

app.get("/", (_req, res) => {
  return res.status(400).json({
    message: "Usage: GET /api/v1/tom",
  });
});

app.get("/health", (_req, res) => {
  return res.sendStatus(200);
});

app.use('/api/v1', require('./routes/api'));

app.use((_req, res) => {
  return res.status(404).json({
    error: "Not Found",
  });
});

module.exports.handler = serverless(app);
