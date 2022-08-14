import * as aws from '@pulumi/aws';
import Config from './config';

const createBucket = () =>
  new aws.s3.Bucket('b', {
    acl: 'public-read',
    bucket: Config.S3_BUCKET_NAME,
  });

export default createBucket;
