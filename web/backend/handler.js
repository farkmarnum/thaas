const wrapper = require('@vendia/serverless-express');
const app = require('./app');

module.exports = {
  handler: wrapper({ app }),
};
