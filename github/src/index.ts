import fetch from 'node-fetch';
import { Probot, Context } from "probot";

const hasCommand = (commentBody: string | null | undefined) => commentBody && /^!hanks\b/m.test(commentBody);

const ISSUE_COMMENT_CREATED = 'issue_comment.created';
const COMMIT_COMMENT_CREATED = 'commit_comment.created';
const PR_DIFF_COMMENT_CREATED = 'pull_request_review_comment.created';
const PR_REVIEW_CREATED = 'pull_request_review.submitted';

type CommentEvents = typeof ISSUE_COMMENT_CREATED | typeof COMMIT_COMMENT_CREATED | typeof PR_DIFF_COMMENT_CREATED
type ReviewEvents = typeof PR_REVIEW_CREATED;

/* Generate tom image URL: */
const getTomUrl = async () => {
  const response = await fetch('https://api.thaas.io/api/v1/integrations/github');
  const data = await response.json() as Record<string, any>;
  const imageUrl = data?.imageUrl;

  if (!imageUrl) {
    console.error('Could not fetch tom:', response);
    throw new Error('Server Error');
  }

  return imageUrl;
}

/* Generate comment text: */
const getCommentBody = async () => {
  const imageUrl = await getTomUrl();

  const body = `![tom hanks](${imageUrl})`;

  return body;
}

const isValidComment = (context: Context<CommentEvents>) => hasCommand(context.payload.comment.body) && !context.isBot;
const isValidReview = (context: Context<ReviewEvents>) => hasCommand(context.payload.review.body) && !context.isBot;

/* Create comment on an issue: */
const createIssueComment = async (context: Context<typeof ISSUE_COMMENT_CREATED | typeof PR_REVIEW_CREATED>) => {
  const body = await getCommentBody();

  return context.octokit.issues.createComment(
    context.issue({ body })
  );
}

/* Reply to a PR comment (in the diff): */
const createPrDiffComment = async (context: Context<typeof PR_DIFF_COMMENT_CREATED>) => {
  const body = await getCommentBody();

  return context.octokit.rest.pulls.createReplyForReviewComment(
    context.pullRequest({
      body,
      comment_id: context.payload.comment.id
    })
  );
}

/* Reply to a comment on a commit (not in PR): */
const createCommitComment = async (context: Context<typeof COMMIT_COMMENT_CREATED>) => {
  const body = await getCommentBody();

  const { commit_id: commit_sha, path, position } = context.payload.comment;

  return context.octokit.rest.repos.createCommitComment(
    context.repo({
      body,
      commit_sha,
      path: path ?? undefined,
      position: position ?? undefined,
    })
  );
}

/* Main: */
export = (app: Probot) => {
  app.on(ISSUE_COMMENT_CREATED, async (context) => {
    console.log('ISSUE_COMMENT_CREATED START')
    app.log.info(context.payload);
    console.log('ISSUE_COMMENT_CREATED END')

    if (!isValidComment(context)) return;

    await createIssueComment(context);
  });

  app.on(PR_DIFF_COMMENT_CREATED, async (context) => {
    console.log('PR_DIFF_COMMENT_CREATED START')
    app.log.info(context.payload);
    console.log('PR_DIFF_COMMENT_CREATED END')

    if (!isValidComment(context)) return;

    await createPrDiffComment(context);
  });

  app.on(COMMIT_COMMENT_CREATED, async (context) => {
    console.log('COMMIT_COMMENT_CREATED START')
    app.log.info(context.payload);
    console.log('COMMIT_COMMENT_CREATED END')

    if (!isValidComment(context)) return;

    await createCommitComment(context);
  });

  app.on(PR_REVIEW_CREATED, async (context) => {
    console.log('PR_REVIEW_CREATED START')
    app.log.info(context.payload);
    console.log('PR_REVIEW_CREATED END')

    if (!isValidReview(context)) return;

    // Note: we use the same API call as we do when replying to a regular issue comment, since reviews show up as an issue comment:
    await createIssueComment(context);
  });
};
