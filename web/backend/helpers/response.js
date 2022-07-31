const formatTextResponse = (response) => ({
  statusCode: 200,
  headers: {
    'Content-Type': 'text/plain',
  },
  body: response,
});

const formatJSONResponse = (response, statusCode) => ({
  statusCode: statusCode || 200,
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(response),
});

const formatFileResponse = (imageData, type = 'image/jpeg') => ({
  statusCode: 200,
  headers: {
    'Content-Type': type,
  },

  body: Buffer.from(imageData).toString('base64'),
  isBase64Encoded: true,
});

module.exports = { formatTextResponse, formatJSONResponse, formatFileResponse };
