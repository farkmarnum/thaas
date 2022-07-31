const { listObjects, getObject } = require('./s3');
const { formatJSONResponse, formatFileResponse } = require('./response');
const { handleCommand } = require('./slack');

const api = async (path, method, params) => {
  if (method === 'GET') {
    switch (path) {
      case '/tom': {
        const objects = await listObjects();
        const index = Math.floor(objects.length * Math.random());
        const object = objects[index];
        const imageData = await getObject(object);

        return formatFileResponse(imageData);
      }

      default:
        return null;
    }
  } else if (method === 'POST') {
    switch (path) {
      case '/slack': {
        const output = handleCommand(params);
        return formatJSONResponse(output);
      }

      case '/github':
        return formatJSONResponse({ message: 'TODO: GitHub integration' });

      default:
        return null;
    }
  }

  return null;
};

module.exports = api;
