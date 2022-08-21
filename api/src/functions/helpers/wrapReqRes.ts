import * as express from 'express';
import { configure } from '@vendia/serverless-express';
import { Context } from 'aws-lambda';
import { Handler } from '../../types';

const wrapReqRes = (
  callback: (req: express.Request, res: express.Response) => Promise<void>,
) => {
  const app = express();

  app.all('/*', async (req, res) => {
    await callback(req, res);
  });

  const handler: Handler = (event, context) =>
    new Promise((resolve, reject) => {
      configure({ app })(
        event,
        context as unknown as Context, // serverlessExpress still supports some deprecated params and requires them to be present, so we're aggressively casting the type here
        (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        },
      );
    });

  return handler;
};

export default wrapReqRes;
