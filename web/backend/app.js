const express = require('express');
const apiRoutes = require('./helpers/apiRoutes');

const app = express();

const USAGE = { message: 'Usage: GET /api/v1/tom' };

app.get('/', (_req, res) => res.status(400).json(USAGE));

app.get('/health', (_req, res) => res.sendStatus(200));

app.use('/api/v1', apiRoutes);

app.use((_req, res) => res.status(404).json({ error: 'Not Found' }));

module.exports = { app };
