import * as pathlib from 'path';

import * as Pulumi from '@pulumi/pulumi';
import * as aws from '@pulumi/aws';
import * as awsx from '@pulumi/awsx';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import { SSM_PREFIX, configForLambda, serviceBaseName } from './config';

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

const createRole = (bucketArn: Pulumi.Output<string>) =>
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
        policy: bucketArn.apply((arn) =>
          JSON.stringify({
            Version: '2012-10-17',
            Statement: [
              {
                Effect: 'Allow',
                Action: [
                  's3:ListBucket',
                  's3:GetObject',
                  's3:GetObjectVersion',
                ],
                Resource: [arn, `${arn}/*`],
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
        ),
      },
    ],
  });

const createLambdaCallback = ({
  name,
  handler,
  role,
}: {
  name: string;
  handler: aws.lambda.Callback<APIGatewayProxyEvent, APIGatewayProxyResult>;
  role: aws.iam.Role;
}) => {
  const prefixedName = `${serviceBaseName}_${name.replace(/\//g, '_')}`;

  return new aws.lambda.CallbackFunction(prefixedName, {
    callback: handler,
    role,
    environment: { variables: configForLambda },
  });
};

type Route = awsx.apigateway.Route;

const API_PREFIX = 'api/v1';

const createLambdaBackedRoutes = (
  bucketArn: Pulumi.Output<string>,
): awsx.apigateway.EventHandlerRoute[] => {
  const role = createRole(bucketArn);

  return Object.entries(API_ROUTES).map(([path, handler]) => ({
    path: `${API_PREFIX}/${path}`,
    method: 'ANY',
    eventHandler: createLambdaCallback({
      name: path,
      handler,
      role,
    }),
  }));
};

const s3ImagesRoute = (bucketDomainName: Pulumi.Output<string>): Route => ({
  path: '/images',
  method: 'GET',
  target: {
    type: 'http_proxy',
    uri: bucketDomainName.apply((domain) => `https://${domain}`),
  },
});

const staticFrontendRoute: Route = {
  path: '/',
  localPath: pathlib.join(__dirname, '../../www'),
};

// Wrapping this in a resource so we can use 'dependsOn' to avoid errors like "Invalid ARN specified in the request" and "The REST API doesn't contain any methods"
class RouteResources extends Pulumi.ComponentResource {
  public routes: Route[];

  constructor(
    name: string,
    {
      imagesBucketArn,
      imagesBucketDomainName,
    }: {
      imagesBucketArn: Pulumi.Output<string>;
      imagesBucketDomainName: Pulumi.Output<string>;
    },
  ) {
    super('pkg:index:RouteResources', name, {
      imagesBucketArn,
      imagesBucketDomainName,
    });

    const lambdaBackedRoutes = createLambdaBackedRoutes(imagesBucketArn);

    this.routes = [
      ...lambdaBackedRoutes,
      s3ImagesRoute(imagesBucketDomainName),
      staticFrontendRoute,
    ];

    this.registerOutputs({
      routes: this.routes,
    });
  }
}

const createApiGateway = (imagesBucket: aws.s3.Bucket) => {
  const routeResources = new RouteResources('apiRoutes', {
    imagesBucketArn: imagesBucket.arn,
    imagesBucketDomainName: imagesBucket.bucketDomainName,
  });

  const { routes } = routeResources;

  return new awsx.apigateway.API(
    'api',
    { routes },
    { dependsOn: [routeResources] },
  );
};

export default createApiGateway;
