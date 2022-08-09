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

Note: the comment must contain a line that begins with the command, and it cannot be immediately followed by word characters. So, `test!hanks` or `!hankstest` would not be recognized as a command.

### Slack

First, [install](https://api.thaas.io/api/v1/integrations/slack/install) the Slack app for your organization.

Then, use the command in a post:
```
/hanks
```


### API

Want to build your own Tom Hanks solution? You can access the API at https://api.thaas.io.

```
curl -s https://api.thaas.io/api/v1/tom > tom.png
```

This API is also the backend for all other platform integrations.


## TODOs
- add some more toms (offline)
- add params to API to specify which type of tom


## hom
tanks

