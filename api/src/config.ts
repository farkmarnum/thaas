import * as pulumi from '@pulumi/pulumi';

const config = new pulumi.Config();

export const serviceBaseName = config.require('SERVICE');

// NON-SECRET CONFIG:
export const DOMAIN = config.require('DOMAIN');
export const SSM_PREFIX = serviceBaseName;
export const S3_BUCKET_NAME = `${serviceBaseName}`;

// WITH SECRET CONFIG (all for lambda env vars):
export const configForLambda = {
  GH_APP_APP_ID: config.requireSecret('GH_APP_APP_ID'),
  GH_APP_PRIVATE_KEY: config.requireSecret('GH_APP_PRIVATE_KEY'),
  GH_APP_WEBHOOK_SECRET: config.requireSecret('GH_APP_WEBHOOK_SECRET'),
  SLACK_CLIENT_ID: config.requireSecret('SLACK_CLIENT_ID'),
  SLACK_CLIENT_SECRET: config.requireSecret('SLACK_CLIENT_SECRET'),
  SLACK_STATE_SECRET: config.requireSecret('SLACK_STATE_SECRET'),
  DOMAIN,
  S3_BUCKET_NAME,
  SSM_PREFIX,
};
