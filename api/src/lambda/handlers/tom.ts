import * as aws from '@pulumi/aws';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { getRandomTomData } from '../helpers/util';

const handler: aws.lambda.Callback<
  APIGatewayProxyEvent,
  APIGatewayProxyResult
> = async () => {
  const { body, headers } = await getRandomTomData();

  return {
    statusCode: 200,
    body,
    headers,
  };
};

export default handler;
