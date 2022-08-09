const { Probot } = require('probot');
const { getCurrentInvoke } = require('@vendia/serverless-express');
const probotApp = require('./probotApp');

const lowercaseKeys = (obj) =>
  Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [key.toLowerCase(), value]),
  );

const handleGitHub = async ({ req, res }) => {
  try {
    // Access Lambda event directly, since that's what Protobot needs:
    const { event } = getCurrentInvoke();

    const config = {
      appId: process.env.GH_APP_APP_ID,
      privateKey: Buffer.from(
        process.env.GH_APP_PRIVATE_KEY,
        'base64',
      ).toString('utf-8'),
      secret: process.env.GH_APP_WEBHOOK_SECRET,
    };

    console.log('config:', config);
    const probot = new Probot();

    await probot.load(probotApp);

    const headersLowerCase = lowercaseKeys(event.headers);

    const data = {
      id: headersLowerCase['x-github-delivery'],
      name: headersLowerCase['x-github-event'],
      signature:
        headersLowerCase['x-hub-signature-256'] ||
        headersLowerCase['x-hub-signature'],
      payload: req.body.toString(),
    };
    console.log('data:', data);

    await probot.webhooks.verifyAndReceive(data);

    res.json({ ok: true });
  } catch (err) {
    console.error(err);

    res.status(404).json({
      error: 'Could not verify message was from GitHub',
    });
  }
};

module.exports = { handleGitHub };
