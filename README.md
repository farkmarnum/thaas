# THaaS
Tom Hanks As A Service


## Mission
It should be possible to summon a picture of Tom Hanks on any platform just by typing a single command.


## Integrations

### GitHub

First, [install](https://github.com/apps/tom-hanks-as-a-service/installations/new) the GitHub App in your repository or organization.

Then, use the command in a PR comment:
```
!hanks
```

The THaaS bot will respond with a tom hanks pic.

Note: the comment must contain a line that begins with the command, and it cannot be immediately followed by word characters. So, `test!hanks` or `!hankstest` would not be recognized as a command.

Also, editing a comment to add `!hanks` will not result in a reply from the bot -- your comment must contain `!hanks` when created to trigger the bot.


### Slack

First, [install](https://thaas.io/api/v1/integrations/slack/install) the Slack app for your organization.

Then, use the command in a post:
```
/hanks
```

The THaaS bot will respond with a tom hanks pic.


### API

You can access the API at `https://thaas.io`.

For example:
```
curl -s https://thaas.io/api/v1/tom > tom.png
```

This API is also the backend for all other platform integrations.


## TODOs
- add some more toms


## hom
tanks

