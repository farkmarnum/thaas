import * as aws from '@pulumi/aws';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { getInstaller } from '../../../helpers/slack';
import ReqResMock from '../../../helpers/ReqResMock';

const handler: aws.lambda.Callback<
  APIGatewayProxyEvent,
  APIGatewayProxyResult
> = async (event) => {
  const { req, res } = ReqResMock({
    path: event.path,
    headers: event.headers,
  });

  const installer = getInstaller();
  await installer.handleInstallPath(req as any, res as any);

  return res.state;
};

export default handler;
