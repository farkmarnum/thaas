import * as awsx from '@pulumi/awsx';
import tomHandler from './handlers/tom';

type Route = awsx.apigateway.Route;

const API_PREFIX = 'api/v1';

const lambdaBackendRoutes: Route[] = [
  {
    path: `${API_PREFIX}/tom`,
    method: 'ANY',
    eventHandler: tomHandler,
  },
  {
    path: `${API_PREFIX}/integrations/slack`,
    method: 'ANY',
    eventHandler: tomHandler, // TODO
  },
  {
    path: `${API_PREFIX}/integrations/github`,
    method: 'ANY',
    eventHandler: tomHandler, // TODO
  },
];

const staticFrontendRoute: Route = {
  path: '/{path+}',
  localPath: 'www',
};

const api = new awsx.apigateway.API('api', {
  routes: [...lambdaBackendRoutes, staticFrontendRoute],
});

console.info(api); // TODO
