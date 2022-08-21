import { APIGatewayProxyEvent } from 'aws-lambda';

import {
  getRequest,
  getResponse,
} from '@vendia/serverless-express/src/event-sources/aws/api-gateway-v2';
import { getRequestResponse } from '@vendia/serverless-express/src/transport';
import Response from '@vendia/serverless-express/src/response';
import isBinary from '@vendia/serverless-express/src/is-binary';

const binarySettings = {
  contentTypes: ['image/*'],
  contentEncodings: ['gzip', 'deflate', 'br'],
};

export const getLambdaReturnFromResponse = ({ res }: { res: Response }) => {
  const { statusCode } = res;
  const headers = Response.headers(res);
  const isBase64Encoded = isBinary({ headers, binarySettings });
  const encoding = isBase64Encoded ? 'base64' : 'utf8';
  const body = Response.body(res).toString(encoding);

  return getResponse({
    statusCode,
    body,
    headers,
    isBase64Encoded,
    response: res,
  });
};

export const getReqResFromLambdaEvent = (event: APIGatewayProxyEvent) => {
  const requestData = getRequest({ event });
  const { request, response } = getRequestResponse(requestData);

  return {
    req: request,
    res: response,
  };
};
