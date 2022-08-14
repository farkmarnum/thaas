import * as aws from '@pulumi/aws';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { installer } from '../../../helpers/slack';
import ReqResMock from '../../../helpers/ReqResMock';

const handler: aws.lambda.Callback<
  APIGatewayProxyEvent,
  APIGatewayProxyResult
> = async (event) => {
  const { req, res } = ReqResMock({
    path: event.path,
    headers: event.headers,
  });

  await installer.handleCallback(req as any, res as any);

  return res.state;
};

export default handler;
