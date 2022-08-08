const API_URL = 'https://api.thaas.io/api/v1/integrations/github';

const commentTriggers = ["issue_comment", "pull_request_review_comment", "commit_comment"];

const commentHandler = (app) =>
  async (context) => {
    app.log.info(context);

    const response = await fetch(API_URL);

    const { imageUrl } = await response.json();

    const body = `![tom hanks](${imageUrl})`;

    return context.octokit.issues.createComment(
      context.issue({ body })
    );
  };

module.exports = (app) => {
  app.on(commentTriggers, commentHandler(app));
};
