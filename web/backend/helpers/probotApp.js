/* eslint-disable camelcase */
const getTom = require('./getTom');

const hasCommand = (commentBody) =>
  commentBody && /^!hanks\b/m.test(commentBody);

const HOMEPAGE = 'https://thaas.io';

const getOriginalCommentUrl = (context) =>
  (context.payload.comment || context.payload.review || {}).html_url;

const getCommentBody = async (context) => {
  const imageUrl = await getTom();
  const fullImageUrl = `https://${imageUrl}`;

  const originalCommentUrl = getOriginalCommentUrl(context) || '#';

  const body = `![tom hanks](${fullImageUrl})\n\n<sup>I am a [bot](${HOMEPAGE}), responding to a [comment](${originalCommentUrl}).</sup>`;

  return body;
};

const isValid = (context) => {
  if (context.isBot) return false;

  const { comment, review } = context.payload;
  const { body } = comment || review || {};

  return hasCommand(body);
};

const createIssueComment = async (context) => {
  const body = await getCommentBody(context);

  return context.octokit.issues.createComment(context.issue({ body }));
};

const createPrDiffComment = async (context) => {
  const body = await getCommentBody(context);

  return context.octokit.rest.pulls.createReplyForReviewComment(
    context.pullRequest({
      body,
      comment_id: context.payload.comment.id,
    }),
  );
};

const createCommitComment = async (context) => {
  const body = await getCommentBody(context);

  const { commit_id: commit_sha, path, position } = context.payload.comment;

  return context.octokit.rest.repos.createCommitComment(
    context.repo({
      body,
      commit_sha,
      path,
      position,
    }),
  );
};

const probotApp = (app) => {
  Object.entries({
    'issue_comment.created': createIssueComment,
    'commit_comment.created': createCommitComment,
    'pull_request_review_comment.created': createPrDiffComment,
    'pull_request_review.submitted': createIssueComment, // Note: we use the same API call as we do when replying to a regular issue comment, since reviews show up as an issue comment
  }).forEach(([event, createCommentFn]) => {
    app.on(event, async (context) => {
      if (!isValid(context)) return;

      await createCommentFn(context);
    });
  });
};

module.exports = probotApp;
