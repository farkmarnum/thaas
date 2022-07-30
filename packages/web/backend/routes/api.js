const router = require('express').Router();

router.get("/tom", (req, res, next) => {
  return res.status(200).json({
    message: "TODO: return an image.",
  });
});

router.post("/integrations/slack", (req, res, next) => {
  return res.status(200).json({
    message: "TODO: API for Slack integration.",
  });
});

router.get("/integrations/slack/oauth", (req, res, next) => {
  return res.status(200).json({
    message: "TODO: handle OAuth for Slack integration (?).",
  });
});

router.post("/integrations/github", (req, res, next) => {
  return res.status(200).json({
    message: "TODO: API for GitHub integration.",
  });
});


module.exports = router;
