import * as aws from '@pulumi/aws';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { getInstaller } from '../../../helpers/slack';
import ReqResMock from '../../../helpers/ReqResMock';

const handler: aws.lambda.Callback<
  APIGatewayProxyEvent,
  APIGatewayProxyResult
> = async (event) => {
  const { path, headers, queryStringParameters } = event;

  const { req, res } = ReqResMock({
    path,
    queryStringParameters,
    headers,
  });

  const installer = getInstaller();
  await installer.handleInstallPath(req as any, res as any);

  return res.state;
};

export default handler;
