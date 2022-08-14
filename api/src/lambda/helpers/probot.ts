import { Probot, Context } from 'probot';
import { getRandomTomUrl } from './util';

const { DOMAIN } = process.env;

const hasCommand = (commentBody: string) =>
  commentBody && /^!hanks\b/m.test(commentBody);

const HOMEPAGE = `https://${DOMAIN}`;

const getOriginalCommentUrl = (context: Context) =>
  ((context.payload as any).comment || (context.payload as any).review || {})
    .html_url;

const getCommentBody = async (context: Context) => {
  const imageUrl = await getRandomTomUrl();
  const fullImageUrl = `https://${imageUrl}`;

  const originalCommentUrl = getOriginalCommentUrl(context) || '#';

  const body = `![tom hanks](${fullImageUrl})\n\n<sup>I am a [bot](${HOMEPAGE}), responding to a [comment](${originalCommentUrl}).</sup>`;

  return body;
};

const isValid = (context: Context) => {
  if (context.isBot) return false;

  const { comment, review } = context.payload as Record<string, any>;
  const { body } = comment || review || {};

  return hasCommand(body);
};

const createIssueComment = async (context: Context) => {
  const body = await getCommentBody(context);

  return context.octokit.issues.createComment(context.issue({ body }));
};

const createPrDiffComment = async (context: Context) => {
  const body = await getCommentBody(context);

  return context.octokit.rest.pulls.createReplyForReviewComment(
    context.pullRequest({
      body,
      comment_id: (context.payload as Record<string, any>).comment.id,
    }),
  );
};

const createCommitComment = async (context: Context) => {
  const body = await getCommentBody(context);

  const {
    commit_id: commitSHA,
    path,
    position,
  } = (context.payload as Record<string, any>).comment;

  return context.octokit.rest.repos.createCommitComment(
    context.repo({
      body,
      commit_sha: commitSHA,
      path,
      position,
    }),
  );
};

type Event =
  | 'issue_comment.created'
  | 'commit_comment.created'
  | 'pull_request_review_comment.created'
  | 'pull_request_review.submitted';

const probotApp = (app: Probot) => {
  Object.entries({
    'issue_comment.created': createIssueComment,
    'commit_comment.created': createCommitComment,
    'pull_request_review_comment.created': createPrDiffComment,
    'pull_request_review.submitted': createIssueComment, // Note: we use the same API call as we do when replying to a regular issue comment, since reviews show up as an issue comment
  }).forEach(([event, createCommentFn]) => {
    app.on(event as Event, async (context) => {
      if (!isValid(context)) return;

      await createCommentFn(context);
    });
  });
};

export default probotApp;
