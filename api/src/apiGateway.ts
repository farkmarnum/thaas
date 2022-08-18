import * as path from 'path';
import * as Pulumi from '@pulumi/pulumi';
import * as awsx from '@pulumi/awsx';

const s3ImagesRoute = (
  imagesBucketUri: Pulumi.Output<string>,
): awsx.apigateway.Route => ({
  path: '/images',
  method: 'GET',
  target: {
    type: 'http_proxy',
    uri: imagesBucketUri,
  },
});

const staticFrontendRoute: awsx.apigateway.Route = {
  path: '/',
  localPath: path.join(__dirname, '../../www'),
};

const createApiGateway = ({
  lambdaRoutes,
  imagesBucketUri,
}: {
  lambdaRoutes: awsx.apigateway.EventHandlerRoute[];
  imagesBucketUri: Pulumi.Output<string>;
}) => {
  const routes: awsx.apigateway.Route[] = [
    ...lambdaRoutes,
    s3ImagesRoute(imagesBucketUri),
    staticFrontendRoute,
  ];

  const KiloByte = 1000;

  return new awsx.apigateway.API('api', {
    routes,
    restApiArgs: { minimumCompressionSize: 10 * KiloByte },
  });
};

export default createApiGateway;
