import * as aws from '@pulumi/aws';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { getRandomTomData } from '../helpers/tom';

const handler: aws.lambda.Callback<
  APIGatewayProxyEvent,
  APIGatewayProxyResult
> = async () => {
  try {
    let t = +new Date();
    const { body, headers } = await getRandomTomData();
    console.log(`getRandomTomData() total: ${+new Date() - t}`);

    t = +new Date();
    const base64 = body.toString('base64');
    console.log(`base64 conversion: ${+new Date() - t}`);

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
