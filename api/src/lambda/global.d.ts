interface EnvVars {
  GH_APP_APP_ID: string;
  GH_APP_PRIVATE_KEY: string;
  GH_APP_WEBHOOK_SECRET: string;
  SLACK_CLIENT_ID: string;
  SLACK_CLIENT_SECRET: string;
  SLACK_STATE_SECRET: string;
  DOMAIN: string;
  S3_BUCKET_NAME: string;
  SSM_PREFIX: string;
}

declare global {
  namespace NodeJS {
    interface ProcessEnv extends EnvVars {}
  }
}

export {};
