import * as aws from '@pulumi/aws';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { Probot } from 'probot';

import probotApp from '../../../helpers/probot';

const { GH_APP_APP_ID, GH_APP_PRIVATE_KEY, GH_APP_WEBHOOK_SECRET } =
  process.env;

const lowercaseKeys = <T>(obj: Record<string, T>): Record<string, T> =>
  Object.fromEntries<T>(
    Object.entries<T>(obj).map(([key, value]) => [key.toLowerCase(), value]),
  );

const handler: aws.lambda.Callback<
  APIGatewayProxyEvent,
  APIGatewayProxyResult
> = async (event) => {
  try {
    const probot = new Probot({
      appId: GH_APP_APP_ID,
      privateKey: Buffer.from(GH_APP_PRIVATE_KEY, 'base64').toString('utf-8'),
      secret: GH_APP_WEBHOOK_SECRET,
    });

    await probot.load(probotApp);

    const headersLowerCase = lowercaseKeys(event.headers);

    type EmitterWebhookEventName = Parameters<
      typeof probot.webhooks.verifyAndReceive
    >[0]['name'];

    await probot.webhooks.verifyAndReceive({
      id: headersLowerCase['x-github-delivery'] || '',
      name: headersLowerCase['x-github-event'] as EmitterWebhookEventName,
      signature:
        headersLowerCase['x-hub-signature-256'] ||
        headersLowerCase['x-hub-signature'] ||
        '',
      payload: Buffer.from(event.body || '', 'base64').toString('utf-8'),
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true }),
    };
  } catch (err) {
    console.error(err);

    return {
      statusCode: 404,
      body: JSON.stringify({
        error: 'Could not verify message was from GitHub',
      }),
    };
  }
};

export default handler;
