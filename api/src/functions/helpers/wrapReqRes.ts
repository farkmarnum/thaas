import { Request, Response } from 'express';
import { configure } from '@vendia/serverless-express';
import { Context } from 'aws-lambda';
import { Handler } from '../../types';

const wrapReqRes = (
  callback: (req: Request, res: Response) => Promise<void>,
) => {
  const handler: Handler = (event, context) =>
    new Promise((resolve, reject) => {
      // NOTE: we're using dynamic import here for express because Pulumi has trouble serializing it:
      import('express').then((express) => {
        const app = express();

        app.all('/*', async (req, res) => {
          await callback(req, res);
        });

        configure({ app })(
          event,
          context as unknown as Context, // NOTE: serverlessExpress still supports some deprecated params and requires them to be present, so we're aggressively casting the type here
          () => {}, // NOTE: serverlessExpress requires a callback but doesn't actually use it -- it returns a promise instead.
        )
          ?.then((data) => {
            resolve(data);
          })
          ?.catch((err) => {
            reject(err);
          });
      });
    });
  return handler;
};

export default wrapReqRes;
