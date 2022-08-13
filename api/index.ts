import * as apigateway from '@pulumi/aws-apigateway';
import tomHandler from './lambda/handlers/tom';

const API_PREFIX = 'api/v1';

const api = new apigateway.RestAPI('api', {
  routes: [
    {
      path: `${API_PREFIX}/tom`,
      eventHandler: tomHandler,
    },
    // Serve an entire directory of static content
    {
      path: '/{path+}',
      localPath: 'www',
    },
    // Proxy requests to another service
    {
      path: 'proxy',
      target: {
        type: 'http_proxy',
        uri: 'https://www.google.com',
      },
    },
    // Use Swagger to define an HTTP proxy route
    {
      path: 'swagger',
      method: 'GET',
      data: {
        'x-amazon-apigateway-integration': {
          httpMethod: 'GET',
          passthroughBehavior: 'when_no_match',
          type: 'http_proxy',
          uri: 'https://httpbin.org/uuid',
        },
      },
    },
    // Authorize requests using Cognito
    {
      path: 'cognito-authorized',
      method: 'GET',
      eventHandler: helloHandler,
      // Use Cognito as authorizer to validate the token from the Authorization header
      authorizers: [
        {
          parameterName: 'Authorization',
          identitySource: ['method.request.header.Authorization'],
          providerARNs: [userPool.arn],
        },
      ],
    },
    // Authorize requests using a Lambda function
    {
      path: 'lambda-authorized',
      method: 'GET',
      eventHandler: helloHandler,
      // Use Lambda authorizer to validate the token from the Authorization header
      authorizers: [
        {
          authType: 'custom',
          parameterName: 'Authorization',
          type: 'request',
          identitySource: ['method.request.header.Authorization'],
          handler: authLambda,
        },
      ],
    },
    // Track and limit requests with API Keys
    {
      path: 'key-authorized',
      method: 'GET',
      eventHandler: helloHandler,
      apiKeyRequired: true,
    },
  ],
});
