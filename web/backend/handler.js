const url = require('url');

const {
  formatTextResponse,
  formatJSONResponse,
} = require('./helpers/response');
const api = require('./helpers/api');

const main = async (event) => {
  const {
    body,
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

    const paramString = Buffer.from(body, 'base64').toString('ascii');
    const paramsParsed = url.parse(`example.com/?${paramString}`, true).query;
    const params = { ...paramsParsed };

    const response = api(subPath, method, params);

    if (response) {
      return response;
    }
  }

  return formatJSONResponse({ message: 'Not Found' }, 404);
};

module.exports = { handler: main };
