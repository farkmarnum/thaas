import * as path from 'path';
import * as awsx from '@pulumi/awsx';
import * as aws from '@pulumi/aws';

const staticFrontendRoute: awsx.apigateway.Route = {
  path: '/',
  localPath: path.join(__dirname, '../../www'),
};

const createApiGateway = ({
  lambdaRoutes,
  bucket,
}: {
  lambdaRoutes: awsx.apigateway.EventHandlerRoute[];
  bucket: aws.s3.Bucket;
}) => {
  const routes: awsx.apigateway.Route[] = [
    ...lambdaRoutes,
    staticFrontendRoute,
  ];

  const KiloByte = 1000;

  return new awsx.apigateway.API('api', {
    routes,
    staticRoutesBucket: bucket,
    restApiArgs: { minimumCompressionSize: 10 * KiloByte },
  });
};

export default createApiGateway;
