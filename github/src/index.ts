import fetch from 'node-fetch';
import { Probot, Context } from "probot";

const hasCommand = (commentBody: string) => /^!hanks\b/m.test(commentBody);

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

const createComment = async (context: Context) => {
  const imageUrl = await getTomUrl();

  const body = `![tom hanks](${imageUrl})`;

  return context.octokit.issues.createComment(
    context.issue({ body })
  );
}

export = (app: Probot) => {
  app.on([
    'issue_comment',
    'commit_comment',
    'pull_request_review_comment'
  ], async (context) => {
    /**
     * Don't continue if:
     *  - event was not a comment creation (i.e. editing or deleting)
     *  - comment does not contain the '!hanks' command
     *  - comment was from a bot
     */
    if (
      context.payload.action !== 'created' ||
      !hasCommand(context.payload.comment.body) ||
      context.isBot
    ) {
      return;
    }

    await createComment(context);
  });
};
