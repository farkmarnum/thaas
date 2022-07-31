const {
  formatTextResponse,
  formatJSONResponse,
} = require('./helpers/response');
const api = require('./helpers/api');

const main = async (event) => {
  const {
    body: params,
    rawPath: path,
    requestContext: {
      http: { method },
    },
  } = event;

  console.info(event);

  if (path === '/health' && method === 'GET') {
    return formatTextResponse('OK');
  }

  if (path.startsWith('/api/v1')) {
    const subPath = path.replace(/^\/api\/v1/, '');

    const response = api(subPath, method, params);

    if (response) {
      return response;
    }
  }

  return formatJSONResponse({ message: 'Not Found' }, 404);
};

module.exports = { handler: main };
