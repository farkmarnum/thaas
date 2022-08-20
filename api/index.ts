import createCert from './src/cert';
import createBucket from './src/bucket';
import createLambdaRoutes from './src/lambdaRoutes';
import createApiGateway from './src/apiGateway';
import createDns from './src/dns';

const { zoneId, certificateArn } = createCert();

const bucket = createBucket();

const lambdaRoutes = createLambdaRoutes(bucket.arn);

const apiGateway = createApiGateway({
  lambdaRoutes,
  bucket,
});

const { apiDnsRecord } = createDns({ apiGateway, zoneId, certificateArn });

export const { fqdn: apiDomain } = apiDnsRecord;

// TODO: metric alarms
// config.requireSecret('ALARM_EMAIL')
