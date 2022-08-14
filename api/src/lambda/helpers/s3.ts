import * as AWS from 'aws-sdk';
import Config from '../../config';

AWS.config.update({ region: 'us-east-1' });

const s3 = new AWS.S3({ apiVersion: '2006-03-01' });

const { S3_BUCKET_NAME: Bucket } = Config;

// Filter out null/undefined in a way that TS can infer:
const notNullOrUndefined = <T>(x: T | undefined | null): x is T => x != null;

export const listObjects = (): Promise<string[]> =>
  new Promise((resolve, reject) => {
    s3.listObjects({ Bucket }, (err, data) => {
      if (err) {
        console.error(err);
        reject(err);
      } else {
        resolve(
          data?.Contents?.map(({ Key }) => Key).filter(notNullOrUndefined) ||
            [],
        );
      }
    });
  });

export const getObject = (
  key: string,
): Promise<{
  body: string | Buffer | Uint8Array;
  headers: Record<string, any>;
}> =>
  new Promise((resolve, reject) => {
    s3.getObject({ Bucket, Key: key })
      .on('httpHeaders', (_statusCode, headersFromS3, response) => {
        const headers = {
          'content-length': headersFromS3['content-length'],
          'content-type': headersFromS3['content-type'],
        };
        const { body } = response.httpResponse;

        resolve({ body, headers });
      })
      .on('error', (err) => {
        console.error(err);
        reject(err);
      });
  });
