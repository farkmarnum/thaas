# THAAS
Tom Hanks As A Service


## Mission
It should be possible to summon a picture of Tom Hanks on any platform just by typing a single command.


## Integrations

### GitHub

To install, add the GitHub Action:
```
todo
```

Then, use the command in a PR comment:
```
!hanks
```


### Slack

First, install the Slack app for your organization.

<!-- TODO: add instructions -->

Then, use the command in a post:
```
/hanks
```


### API

Want to build your own Tom Hanks solution? You can access the API at https://api.thaas.io.

```
curl -s https://api.thaas.io/api/v1/tom?params=here > tom.png
```

This API is also the backend for all other platform integrations.


## TODOs
### Top priority
- write the Slack integration
- write the GitHub integration
### Other
- switch to using @vendia/serverless-express or similar for backend
- add some more toms (offline)
- add params to API to specify which type of tom

## hom
tanks

