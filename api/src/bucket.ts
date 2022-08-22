import * as aws from '@pulumi/aws';
import { S3_BUCKET_NAME } from './config';

const createBucket = () =>
  new aws.s3.Bucket('bucket', {
    bucket: S3_BUCKET_NAME,
    website: {
      indexDocument: 'index.html',
    },
  });

export default createBucket;
