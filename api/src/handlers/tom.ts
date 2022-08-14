import * as aws from '@pulumi/aws';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { getObject } from '../helpers/s3';
import { getRandomTomKey } from '../helpers/util';

const handler: aws.lambda.EventHandler<
  APIGatewayProxyEvent,
  APIGatewayProxyResult
> = async () => {
  const key = await getRandomTomKey();
  const { body, headers } = await getObject(key);

  return {
    statusCode: 200,
    body: body.toString(),
    headers,
  };
};

export default handler;
