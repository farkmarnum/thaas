import fetch from 'node-fetch';
import { Probot, Context } from "probot";
import {
  PullRequestReviewSubmittedEvent,
  IssueCommentCreatedEvent,
  CommitCommentCreatedEvent,
  PullRequestReviewCommentCreatedEvent,
} from "@octokit/webhooks-types/schema";

const hasCommand = (commentBody: string | null | undefined) => commentBody && /^!hanks\b/m.test(commentBody);

const API_URL = 'https://api.thaas.io/api/v1/integrations/github';
const HOMEPAGE = 'https://thaas.io';

const ISSUE_COMMENT_CREATED = 'issue_comment.created';
const COMMIT_COMMENT_CREATED = 'commit_comment.created';
const PR_DIFF_COMMENT_CREATED = 'pull_request_review_comment.created';
const PR_REVIEW_CREATED = 'pull_request_review.submitted';

type IssueCommentContext = Context<typeof ISSUE_COMMENT_CREATED>
type CommitCommentCreatedContext = Context<typeof COMMIT_COMMENT_CREATED>;
type PrDiffCommentCreatedContext = Context<typeof PR_DIFF_COMMENT_CREATED>;
type PrReviewCreatedContext = Context<typeof PR_REVIEW_CREATED>;

type CommentContext = IssueCommentContext | CommitCommentCreatedContext | PrDiffCommentCreatedContext;
type ReviewContext = PrReviewCreatedContext;

type AnyContext = CommentContext | ReviewContext;

type CommentPayload = IssueCommentCreatedEvent | CommitCommentCreatedEvent | PullRequestReviewCommentCreatedEvent;
type ReviewPayload = PullRequestReviewSubmittedEvent;

/* Generate tom image URL: */
const getTomUrl = async () => {
  const response = await fetch(API_URL);
  const data = await response.json() as Record<string, any>;
  const imageUrl = data?.imageUrl;

  if (!imageUrl) {
    console.error('Could not fetch tom:', response);
    throw new Error('Server Error');
  }

  return imageUrl;
}

const getOriginalCommentUrl = (context: AnyContext): string => {
  const commentPayload = context.payload as CommentPayload;
  if (commentPayload.comment) return commentPayload.comment.html_url;

  const reviewPayload = context.payload as ReviewPayload;
  return reviewPayload.review.html_url;
}

/* Generate comment text: */
const getCommentBody = async (context: AnyContext) => {
  const imageUrl = await getTomUrl();
  const originalCommentUrl = getOriginalCommentUrl(context);

  // const body = `![tom hanks](${imageUrl})\n\n<sup>I am a [bot](${HOMEPAGE})</sup>, responding to a [comment](${originalCommentUrl}).`;

  return '';
}

const isValid = (context: AnyContext) => {
  if (context.isBot) return false;

  const commentPayload = context.payload as CommentPayload;
  if (commentPayload.comment) return hasCommand(commentPayload.comment.body);

  const reviewPayload = context.payload as ReviewPayload;
  return hasCommand(reviewPayload.review.body);
};

/* Create comment on an issue: */
const createIssueComment = async (context: AnyContext) => {
  const body = await getCommentBody(context);

  return context.octokit.issues.createComment(
    context.issue({ body })
  );
}

/* Reply to a PR comment (in the diff): */
const createPrDiffComment = async (context: PrDiffCommentCreatedContext) => {
  const body = await getCommentBody(context);

  return context.octokit.rest.pulls.createReplyForReviewComment(
    context.pullRequest({
      body,
      comment_id: context.payload.comment.id
    })
  );
}

/* Reply to a comment on a commit (not in PR): */
const createCommitComment = async (context: Context<typeof COMMIT_COMMENT_CREATED>) => {
  const body = await getCommentBody(context);

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
    console.log('ISSUE_COMMENT_CREATED START'); app.log.info(context.payload); console.log('ISSUE_COMMENT_CREATED END'); // TODO: REMOVE

    if (!isValid(context)) return;

    await createIssueComment(context);
  });

  app.on(PR_DIFF_COMMENT_CREATED, async (context) => {
    console.log('PR_DIFF_COMMENT_CREATED START'); app.log.info(context.payload); console.log('PR_DIFF_COMMENT_CREATED END'); // TODO: REMOVE

    if (!isValid(context)) return;

    await createPrDiffComment(context);
  });

  app.on(COMMIT_COMMENT_CREATED, async (context) => {
    console.log('COMMIT_COMMENT_CREATED START'); app.log.info(context.payload); console.log('COMMIT_COMMENT_CREATED END'); // TODO: REMOVE

    if (!isValid(context)) return;

    await createCommitComment(context);
  });

  app.on(PR_REVIEW_CREATED, async (context) => {
    console.log('PR_REVIEW_CREATED START'); app.log.info(context.payload); console.log('PR_REVIEW_CREATED END'); // TODO: REMOVE

    if (!isValid(context)) return;

    // Note: we use the same API call as we do when replying to a regular issue comment, since reviews show up as an issue comment:
    await createIssueComment(context);
  });
};
