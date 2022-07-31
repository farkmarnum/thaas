const formatResponse = require('./helpers/formatResponse');
const api = require('./helpers/api');

const main = async (event) => {
  const {
    // queryStringParameters,
    rawPath: path,
    requestContext: {
      http: { method },
    },
  } = event;

  if (path === '/health' && method === 'GET') {
    return formatResponse({ message: 'OK' });
  }

  if (path.startsWith('/api/v1')) {
    const subPath = path.replace(/^\/api\/v1/, '');

    const response = api(subPath, method);

    if (response) {
      return formatResponse(response);
    }
  }

  return formatResponse({ message: 'Not Found' }, 404);
};

module.exports = { handler: main };
