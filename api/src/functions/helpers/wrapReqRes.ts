import { Request, Response } from 'express';
import { configure } from '@vendia/serverless-express';
import { Context } from 'aws-lambda';
import { Handler } from '../../types';

const wrapReqRes = (
  callback: (req: Request, res: Response) => Promise<void>,
) => {
  const handler: Handler = (event, context) =>
    new Promise((resolve, reject) => {
      import('express').then((express) => {
        const app = express();

        app.all('/*', async (req, res) => {
          await callback(req, res);
        });

        configure({ app })(
          event,
          context as unknown as Context, // serverlessExpress still supports some deprecated params and requires them to be present, so we're aggressively casting the type here
          (err, data) => {
            if (err) {
              reject(err);
            } else {
              resolve(data);
            }
          },
        );
      });
    });
  return handler;
};

export default wrapReqRes;
