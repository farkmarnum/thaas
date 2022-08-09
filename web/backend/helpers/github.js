const { Probot } = require('probot');
const { getCurrentInvoke } = require('@vendia/serverless-express');
const probotApp = require('./probotApp');

const lowercaseKeys = (obj) =>
  Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [key.toLowerCase(), value]),
  );

const handleGitHub = async ({ res }) => {
  try {
    // Access Lambda event directly, since that's what Protobot needs:
    const { event } = getCurrentInvoke();

    const probot = new Probot({
      appId: process.env.GH_APP_APP_ID,
      privateKey: Buffer.from(
        process.env.GH_APP_PRIVATE_KEY,
        'base64',
      ).toString('utf-8'),
      secret: process.env.GH_APP_WEBHOOK_SECRET,
    });

    await probot.load(probotApp);

    const headersLowerCase = lowercaseKeys(event.headers);

    await probot.webhooks.verifyAndReceive({
      id: headersLowerCase['x-github-delivery'],
      name: headersLowerCase['x-github-event'],
      signature:
        headersLowerCase['x-hub-signature-256'] ||
        headersLowerCase['x-hub-signature'],
      payload: event.body,
    });

    res.json({ ok: true });
  } catch (err) {
    res.status(404).json({
      error: 'Could not verify message was from GitHub',
    });
  }
};

module.exports = { handleGitHub };
