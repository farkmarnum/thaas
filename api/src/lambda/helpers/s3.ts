import * as AWS from 'aws-sdk';
import { AWS_REGION } from '../../config';
import { notNullOrUndefined } from './util';

const getS3 = () => {
  AWS.config.update({ region: AWS_REGION });
  AWS.config.logger = console;
  return new AWS.S3({ apiVersion: '2006-03-01' });
};

const getBucketName = () => {
  const { S3_BUCKET_NAME } = process.env;
  if (!S3_BUCKET_NAME) throw new Error('S3_BUCKET_NAME must be set!');
  return S3_BUCKET_NAME;
};

export const listObjects = async (): Promise<string[]> => {
  const s3 = getS3();
  const response = await s3.listObjects({ Bucket: getBucketName() }).promise();

  return (
    response.Contents?.map(({ Key }) => Key).filter(notNullOrUndefined) || []
  );
};

export const getObject = async (
  key: string,
): Promise<{
  body: AWS.S3.Body;
  headers: Record<string, any>;
}> => {
  const s3 = getS3();
  const response = await s3
    .getObject({ Bucket: getBucketName(), Key: key })
    .promise();

  const { Body, ContentLength, ContentType } = response;

  return {
    body: Body || '',
    headers: {
      'Content-Length': ContentLength,
      'Content-Type': ContentType,
    },
  };
};
