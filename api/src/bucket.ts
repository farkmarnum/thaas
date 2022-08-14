import * as aws from '@pulumi/aws';
import { S3_BUCKET_NAME } from './config';

const createBucket = () =>
  new aws.s3.Bucket('imagesBucket', {
    acl: 'public-read',
    bucket: S3_BUCKET_NAME,
  });

export default createBucket;
