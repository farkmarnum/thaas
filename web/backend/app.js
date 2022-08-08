const express = require('express');

const apiRoutes = require('./helpers/api');

const app = express();

app.get('/', (_req, res) =>
  res.status(400).json({
    message: 'Usage: GET /api/v1/tom',
  }),
);

app.get('/health', (_req, res) => res.sendStatus(200));

app.use('/api/v1', apiRoutes);

app.use((_req, res) =>
  res.status(404).json({
    error: 'Not Found',
  }),
);

module.exports = { app };
