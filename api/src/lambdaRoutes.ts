import * as Pulumi from '@pulumi/pulumi';
import * as aws from '@pulumi/aws';
import * as awsx from '@pulumi/awsx';

import { configForLambda, serviceBaseName } from './config';
import WarmLambda from './components/WarmLambda';
import { createRole } from './lambdaRoles';

import tom from './functions/handlers/tom';
import github from './functions/handlers/integrations/github';
import slack from './functions/handlers/integrations/slack';
import slackInstall from './functions/handlers/integrations/slack/install';
import slackOAuth from './functions/handlers/integrations/slack/oauth';

import { Handler } from './types';

const API_ROUTES = {
  tom,
  'integrations/github': github,
  'integrations/slack': slack,
  'integrations/slack/install': slackInstall,
  'integrations/slack/oauth': slackOAuth,
};

const createLambdaCallback = ({
  name,
  handler,
  role,
}: {
  name: string;
  handler: Handler;
  role: aws.iam.Role;
}) => {
  // Replace any characters that are not "letters, numbers, hyphens, or underscores" with underscores:
  const prefixedName = `${serviceBaseName}_${name.replace(/[^a-z0_-]/gi, '_')}`;

  return new WarmLambda(prefixedName, {
    handler,
    role,
    environment: { variables: configForLambda },
    timeout: 15, // Set it super long to handle extreme cold starts sometimes
    memorySize: 1024, // Use more than the minimum since it makes things run faster and works out to a similar cost
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
    eventHandler: createLambdaCallback({ name, handler, role }).lambda,
  }));
};

export default createLambdaRoutes;
