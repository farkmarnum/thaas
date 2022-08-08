require('dotenv').config();

const { app } = require('./app');

const { PORT } = process.env;

const port = PORT || 3333;

app.listen(port, () =>
  console.info(`Server running at http://localhost:${port}`),
);
