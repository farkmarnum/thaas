import * as pulumi from '@pulumi/pulumi';
import * as aws from '@pulumi/aws';
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  EventBridgeEvent,
} from 'aws-lambda';

type WarmingEvent = EventBridgeEvent<string, unknown>;

const wrapHandlerForWarmer =
  ({
    handler,
    eventRule,
  }: {
    handler: Handler;
    eventRule: aws.cloudwatch.EventRule;
  }): Handler =>
  async (
    event: APIGatewayProxyEvent | WarmingEvent,
    context: aws.lambda.Context,
  ) => {
    const warmingEvent = event as WarmingEvent;
    if (
      warmingEvent?.resources &&
      warmingEvent.resources[0] &&
      warmingEvent.resources[0].includes(eventRule.name.get())
    ) {
      console.info('Warming...');
      return { statusCode: 200, body: 'Warmed!' };
    }

    const apiGatewayEvent = event as APIGatewayProxyEvent;
    console.info('Running the handler...');
    return handler(apiGatewayEvent, context);
  };

/**
 * Given an aws.lambda.Callback, creates the following:
 * - a Lambda Function, which wraps the callback in some logic to short-circuit warming requests
 * - a Cloudwatch Event Rule that runs every 5 minutes
 * - a CloudWatch Event Rule Subscription so that the Lambda is called every 5 minutes for warming
 *
 * Note: mostly taken from mikhailshilkov/pulumi-serverless-examples:
 *   @see https://github.com/mikhailshilkov/pulumi-serverless-examples/blob/4af01d1e44a04ca3b6743665a2ff2e11f5e2f1eb/WarmedLambda-TypeScript/warmLambda.ts
 */
class WarmLambda extends pulumi.ComponentResource {
  public lambda: aws.lambda.Function;

  public subscription: aws.cloudwatch.EventRuleEventSubscription;

  public eventRule: aws.cloudwatch.EventRule;

  constructor(
    name: string,
    args: Omit<aws.lambda.BaseCallbackFunctionArgs, 'handler'> & {
      handler: Handler;
    },
    opts?: pulumi.ResourceOptions,
  ) {
    const { handler } = args;
    const lambdaArgs: aws.lambda.CallbackFunctionArgs<
      APIGatewayProxyEvent,
      APIGatewayProxyResult
    > = Object.fromEntries(
      Object.entries(args).filter(([k]) => k !== 'handler'),
    );

    if (!name) throw new Error('Missing required resource name');
    if (!handler) throw new Error('Missing required function handler');

    super('custom:WarmLambda', name);

    const eventRule = new aws.cloudwatch.EventRule(
      `${name}-warming-rule`,
      { scheduleExpression: 'rate(5 minutes)' },
      { parent: this, ...opts },
    );

    const wrappedHandler = wrapHandlerForWarmer({
      handler,
      eventRule,
    });

    const lambda = new aws.lambda.CallbackFunction<
      APIGatewayProxyEvent,
      APIGatewayProxyResult
    >(name, { callback: wrappedHandler, ...lambdaArgs });

    const subscription = new aws.cloudwatch.EventRuleEventSubscription(
      `${name}-warming-subscription`,
      eventRule,
      lambda,
      {},
      { parent: this, ...opts },
    );

    this.lambda = lambda;
    this.eventRule = eventRule;
    this.subscription = subscription;
  }
}

export default WarmLambda;
