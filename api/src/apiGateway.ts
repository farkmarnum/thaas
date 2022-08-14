import * as Pulumi from '@pulumi/pulumi';
import * as aws from '@pulumi/aws';
import * as awsx from '@pulumi/awsx';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import { SSM_PREFIX, configForLambda } from './config';

import tom from './lambda/handlers/tom';
import github from './lambda/handlers/integrations/github';
import slack from './lambda/handlers/integrations/slack';
import slackInstall from './lambda/handlers/integrations/slack/install';
import slackOAuth from './lambda/handlers/integrations/slack/oauth';

const API_ROUTES = {
  tom,
  'integrations/github': github,
  'integrations/slack': slack,
  'integrations/slack/install': slackInstall,
  'integrations/slack/oauth': slackOAuth,
};

const role = (bucketArn: Pulumi.Output<string>) =>
  new aws.iam.Role('apiLambdasRole', {
    assumeRolePolicy: `{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
`,
    inlinePolicies: [
      {
        name: 'my_inline_policy',
        policy: JSON.stringify({
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Action: ['s3:ListBucket', 's3:GetObject', 's3:GetObjectVersion'],
              Resource: [bucketArn, bucketArn.apply((arn) => `${arn}/*`)],
            },
            {
              Effect: 'Allow',
              Action: [
                'ssm:PutParameter',
                'ssm:DeleteParameter',
                'ssm:GetParameterHistory',
                'ssm:GetParametersByPath',
                'ssm:GetParameters',
                'ssm:GetParameter',
                'ssm:DeleteParameters',
              ],
              Resource: `arn:aws:ssm:*:*:parameter${SSM_PREFIX}/*`,
            },
            {
              Effect: 'Allow',
              Action: 'ssm:DescribeParameters',
              Resource: '*',
            },
          ],
        }),
      },
    ],
  });

const makeLambda = (
  callback: aws.lambda.Callback<APIGatewayProxyEvent, APIGatewayProxyResult>,
  bucketArn: Pulumi.Output<string>,
) =>
  new aws.lambda.CallbackFunction('mylambda', {
    callback,
    role: role(bucketArn),
    environment: { variables: configForLambda },
  });

type Route = awsx.apigateway.Route;

const API_PREFIX = 'api/v1';

const lambdaBackedRoutes = (bucketArn: Pulumi.Output<string>): Route[] =>
  Object.entries(API_ROUTES).map(([path, handler]) => ({
    path: `${API_PREFIX}/${path}`,
    method: 'ANY',
    eventHandler: makeLambda(handler, bucketArn),
  }));

const s3ImagesRoute = (bucketDomainName: Pulumi.Output<string>): Route => ({
  path: '/images/{path+}',
  method: 'GET',
  target: {
    type: 'http_proxy',
    uri: bucketDomainName,
  },
});

const staticFrontendRoute: Route = {
  path: '/{path+}',
  localPath: 'www',
};

const createApiGateway = (imagesBucket: aws.s3.Bucket) =>
  new awsx.apigateway.API('api', {
    routes: [
      ...lambdaBackedRoutes(imagesBucket.arn),
      s3ImagesRoute(imagesBucket.bucketDomainName),
      staticFrontendRoute,
    ],
  });

export default createApiGateway;
