const lowercaseKeys = require('lowercase-keys');

const lambdaFunction = async (probot, event) => {
  try {
    const headersLowerCase = lowercaseKeys(event.headers);

    await probot.webhooks.verifyAndReceive({
      id: headersLowerCase['x-github-delivery'],
      name: headersLowerCase['x-github-event'],
      signature:
        headersLowerCase['x-hub-signature-256'] ||
        headersLowerCase['x-hub-signature'],
      payload: event.body,
    });

    return {
      statusCode: 200,
      body: 'JSON.stringify({ ok: true })',
    };
  } catch (err) {
    return {
      statusCode: 500,
      error: 'Could not verify message was from GitHub',
    };
  }
};

module.exports = { lambdaFunction };
