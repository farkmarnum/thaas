const router = require('express').Router();


app.get("tom", (req, res, next) => {
  return res.status(200).json({
    message: "TODO: return an image.",
  });
});

app.get("slack", (req, res, next) => {
  return res.status(200).json({
    message: "TODO: API for Slack integration.",
  });
});

app.get("slack/oauth", (req, res, next) => {
  return res.status(200).json({
    message: "TODO: handle OAuth for Slack integration (?).",
  });
});

app.get("github", (req, res, next) => {
  return res.status(200).json({
    message: "TODO: API for GitHub integration.",
  });
});


module.exports = router;
