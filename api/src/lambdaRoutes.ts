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
    managedPolicyArns: [
      'arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole',
    ],
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
  // Replace any characters that are not "letters, numbers, hyphens, or underscores" with underscores:
  const prefixedName = `${serviceBaseName}_${name.replace(/[^a-z0_-]/gi, '_')}`;

  return new aws.lambda.CallbackFunction(prefixedName, {
    callback: handler,
    role,
    environment: { variables: configForLambda },
  });
};

const API_PREFIX = '/api/v1';

const createLambdaRoutes = (
  bucketArn: Pulumi.Output<string>,
): awsx.apigateway.EventHandlerRoute[] => {
  const role = createRole(bucketArn);

  return Object.entries(API_ROUTES).map(([name, handler]) => ({
    path: `${API_PREFIX}/${name}`,
    method: 'ANY',
    eventHandler: createLambdaCallback({ name, handler, role }),
  }));
};

export default createLambdaRoutes;
