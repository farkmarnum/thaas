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
