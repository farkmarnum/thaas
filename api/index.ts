import createApiGateway from './src/apiGateway';
import createBucket from './src/bucket';
import createDns from './src/dns';

const main = async () => {
  // Bucket for image hosting:
  const bucket = createBucket();

  // API Gateway + Lambda Functions + Static frontend:
  const apiGateway = await createApiGateway(bucket);

  // DNS Records:
  createDns(apiGateway);

  // TODO: metric alarms
  // config.requireSecret('ALARM_EMAIL')
};

main();
