const formatResponse = (response) => ({
  statusCode: 200,
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(response),
});

module.exports = {
  formatResponse,
};
