type AwsLambdaCallback = import('@pulumi/aws').lambda.Callback<
  import('aws-lambda').APIGatewayProxyEvent,
  import('aws-lambda').APIGatewayProxyResult
>;

/*
 * Note: this is just the aws.lambda.Callback<APIGatewayProxyEvent, APIGatewayProxyResult>
 * type but restricted to only the promise approach. The differences are:
 *  - it can't return void
 *  - it doesn't accept a 3rd 'callback' argument
 */
type Handler = (
  event: Parameters<AwsLambdaCallback>[0],
  context: Parameters<AwsLambdaCallback>[1],
) => Exclude<ReturnType<AwsLambdaCallback>, void>;

interface RequestData {
  method: string;
  headers: Record<string, any>;
  body: string;
  remoteAddress: any;
  path: string;
}

interface ResponseData {
  statusCode: number;
  body: string;
  headers: Record<string, any>;
  isBase64Encoded: boolean;
  response: Record<string, any>;
}

declare module '@vendia/serverless-express/src/event-sources/aws/api-gateway-v2' {
  export function getRequest(arg0: {
    event: import('aws-lambda').APIGatewayProxyEvent;
  }): RequestData;

  export function getResponse(arg0: ResponseData): {
    statusCode: number;
    body: string;
    isBase64Encoded: boolean;
  };
}

declare module '@vendia/serverless-express/src/transport' {
  export function getRequestResponse(arg0: RequestData): {
    request: import('http').IncomingMessage;
    response: import('http').ServerResponse;
  };
}

declare module '@vendia/serverless-express/src/is-binary' {
  export default function isBinary(arg0: {
    headers: Record<string, any>;
    binarySettings: any;
  }): boolean;
}

declare module '@vendia/serverless-express/src/response' {
  export default class ServerlessResponse extends (await import('http'))
    .ServerResponse {
    static body(res: ServerlessResponse): Buffer;
    static headers(res: ServerlessResponse): Record<string, any>;
  }
}
