import * as pulumi from '@pulumi/pulumi';

const config = new pulumi.Config();

const serviceBaseName = config.require('SERVICE');

export default {
  DOMAIN: config.require('DOMAIN'),
  ALARM_EMAIL: config.requireSecret('ALARM_EMAIL').get(),
  GH_APP_APP_ID: config.requireSecret('GH_APP_APP_ID').get(),
  GH_APP_PRIVATE_KEY: config.requireSecret('GH_APP_PRIVATE_KEY').get(),
  GH_APP_WEBHOOK_SECRET: config.requireSecret('GH_APP_WEBHOOK_SECRET').get(),
  SLACK_CLIENT_ID: config.requireSecret('SLACK_CLIENT_ID').get(),
  SLACK_CLIENT_SECRET: config.requireSecret('SLACK_CLIENT_SECRET').get(),
  SLACK_STATE_SECRET: config.requireSecret('SLACK_STATE_SECRET').get(),
  S3_BUCKET_NAME: `${serviceBaseName}-images`,
  SSM_PREFIX: serviceBaseName,
};
