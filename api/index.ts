import createCert from './src/cert';
import createBucket from './src/bucket';
import createLambdaRoutes from './src/lambdaRoutes';
import createApiGateway from './src/apiGateway';
import createDns from './src/dns';

const { zoneId, certificateArn } = createCert();

const imagesBucket = createBucket();
const imagesBucketUri = imagesBucket.bucketDomainName.apply(
  (domain) => `https://${domain}`,
);

const lambdaRoutes = createLambdaRoutes(imagesBucket.arn);

const apiGateway = createApiGateway({
  lambdaRoutes,
  imagesBucketUri,
});

const { apiDnsRecord } = createDns({ apiGateway, zoneId, certificateArn });

export const { fqdn: apiDomain } = apiDnsRecord;

// TODO: metric alarms
// config.requireSecret('ALARM_EMAIL')
