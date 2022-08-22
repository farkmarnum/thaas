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
export type Handler = (
  event: Parameters<AwsLambdaCallback>[0],
  context: Parameters<AwsLambdaCallback>[1],
) => Exclude<ReturnType<AwsLambdaCallback>, void>;
