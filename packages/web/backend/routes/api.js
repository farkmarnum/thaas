const router = require('express').Router();

router.get("tom", (req, res, next) => {
  return res.status(200).json({
    message: "TODO: return an image.",
  });
});

router.get("slack", (req, res, next) => {
  return res.status(200).json({
    message: "TODO: API for Slack integration.",
  });
});

router.get("slack/oauth", (req, res, next) => {
  return res.status(200).json({
    message: "TODO: handle OAuth for Slack integration (?).",
  });
});

router.get("github", (req, res, next) => {
  return res.status(200).json({
    message: "TODO: API for GitHub integration.",
  });
});


module.exports = router;
