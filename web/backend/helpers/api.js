const url = require('url');

const router = require('express').Router();

const { listObjects, streamObject } = require('./s3');
const {
  handleCommand,
  handleSlackOAuth,
  handleSlackInstall,
} = require('./slack');

router.get('/tom', async (_req, res) => {
  const objects = await listObjects();
  const index = Math.floor(objects.length * Math.random());
  const key = objects[index];

  await streamObject(key, res);
});

router.post('/integrations/slack', async (req, res) => {
  const paramString = Buffer.from(req.body, 'base64').toString('ascii');
  const paramsParsed = url.parse(`example.com/?${paramString}`, true).query;
  const bodyParams = { ...paramsParsed };

  res.json(await handleCommand(bodyParams));
});

router.get('/integrations/slack/oauth', async (req, res) => {
  await handleSlackOAuth(req, res);
});

router.get('/integrations/slack/install', async (req, res) => {
  await handleSlackInstall(req, res);
});

router.post('/integrations/github', async (_req, res) => {
  res.json({ message: 'TODO: GitHub integration' });
});

module.exports = router;
