import * as aws from '@pulumi/aws';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { getRandomTomData } from '../helpers/tom';

const handler: aws.lambda.Callback<
  APIGatewayProxyEvent,
  APIGatewayProxyResult
> = async () => {
  try {
    const { body, headers } = await getRandomTomData();
    const base64 = body.toString('base64');

    return {
      statusCode: 200,
      headers,
      body: base64,
      isBase64Encoded: true,
    };
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: 'Server Error',
    };
  }
};

export default handler;
