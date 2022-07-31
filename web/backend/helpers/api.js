const url = require('url');

const router = require('serverless-express/express').Router();

const { listObjects, getObject } = require('./s3');
const { handleCommand, handleOAuth } = require('./slack');

router.get('/tom', async (_req, res) => {
  const objects = await listObjects();
  const index = Math.floor(objects.length * Math.random());
  const object = objects[index];
  const imageData = await getObject(object);

  res.sendFile(imageData);
});

router.post('/integrations/slack', async (req, res) => {
  const paramString = Buffer.from(req.body, 'base64').toString('ascii');
  const paramsParsed = url.parse(`example.com/?${paramString}`, true).query;
  const bodyParams = { ...paramsParsed };

  res.json(await handleCommand(bodyParams));
});

router.get('/integrations/slack/oauth', async (req, res) => {
  await handleOAuth(req, res);
});

router.post('/integrations/github', async (_req, res) => {
  res.json({ message: 'TODO: GitHub integration' });
});

module.exports = router;
