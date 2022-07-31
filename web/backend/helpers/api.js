const api = (path, method) => {
  if (method === 'GET') {
    switch (path) {
      case '/tom':
        return { message: 'TODO: add image of tom' };
      default:
        return null;
    }
  } else if (method === 'POST') {
    switch (path) {
      case '/slack':
        return { message: 'TODO: Slack integration' };
      case '/slack/oauth':
        return { message: 'TODO: Slack integration - OAuth' };
      case '/github':
        return { message: 'TODO: GitHub integration' };
      default:
        return null;
    }
  }

  return null;
};

module.exports = api;
