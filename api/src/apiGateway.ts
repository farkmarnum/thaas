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
                Resource: `arn:aws:ssm:*:*:parameter/${SSM_PREFIX}/*`,
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

const API_PREFIX = '/api/v1';

const createApiGateway = (imagesBucket: aws.s3.Bucket) => {
  const role = createRole(imagesBucket.arn);

  const routes: awsx.apigateway.Route[] = [
    {
      path: `${API_PREFIX}/tom`,
      method: 'GET',
      eventHandler: createLambdaCallback({
        name: 'tom',
        handler: tom,
        role,
      }),
    },
    {
      path: `${API_PREFIX}/integrations/slack`,
      method: 'ANY',
      eventHandler: createLambdaCallback({
        name: 'slack',
        handler: slack,
        role,
      }),
    },
    {
      path: `${API_PREFIX}/integrations/slack/install`,
      method: 'ANY',
      eventHandler: createLambdaCallback({
        name: 'slackInstall',
        handler: slackInstall,
        role,
      }),
    },
    {
      path: `${API_PREFIX}/integrations/slack/oauth`,
      method: 'ANY',
      eventHandler: createLambdaCallback({
        name: 'slackOAuth',
        handler: slackOAuth,
        role,
      }),
    },
    {
      path: `${API_PREFIX}/integrations/github`,
      method: 'ANY',
      eventHandler: createLambdaCallback({
        name: 'github',
        handler: github,
        role,
      }),
    },
    {
      path: '/images',
      method: 'GET',
      target: {
        type: 'http_proxy',
        uri: imagesBucket.bucketDomainName.apply(
          (domain) => `https://${domain}`,
        ),
      },
    },
    {
      path: '/',
      localPath: pathlib.join(__dirname, '../../www'),
    },
  ];

  return new awsx.apigateway.API('api', { routes });
};

export default createApiGateway;
