const commentTriggers = ["issue_comment", "pull_request_review_comment", "commit_comment"];

const commentHandler = async (context) => {
  app.log.info(context);

  const imageUrl = 'TODO';

  const body = `![tom hanks](${imageUrl})`;

  return context.octokit.issues.createComment(
    context.issue({ body })
  );
};

module.exports = (app) => {
  app.on(commentTriggers, commentHandler);;
};
