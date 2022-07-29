import { Handler } from 'aws-lambda'
import { assertType } from 'typescript-is';

type MyEvent = {
  name: string
}

export const handler: Handler = async (event: MyEvent) => {
  // validate event at runtime
  assertType<MyEvent>(event)

  return { msg: `Hello ${event.name}` }
}

exports.handler = handler
