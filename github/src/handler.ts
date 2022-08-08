import {
  createLambdaFunction,
  createProbot,
} from "@probot/adapter-aws-lambda-serverless";

import appFn from '.';

export const webhooks = createLambdaFunction(appFn, {
  probot: createProbot(),
});
