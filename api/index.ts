import createApiGateway from './src/apiGateway';
import createBucket from './src/bucket';
import createDns from './src/dns';

// Bucket for image hosting:
const bucket = createBucket();

// API Gateway + Lambda Functions + Static frontend:
const apiGateway = createApiGateway(bucket);

// DNS Records:
createDns(apiGateway);

// TODO: metric alarms
// config.requireSecret('ALARM_EMAIL')