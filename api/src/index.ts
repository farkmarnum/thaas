import createApiGateway from './apiGateway';
import createBucket from './bucket';
import createDns from './dns';

// Bucket for image hosting:
const bucket = createBucket();

// API Gateway + Lambda Functions + Static frontend:
const apiGateway = createApiGateway(bucket);

// DNS Records:
createDns(apiGateway);

// TODO: metric alarms
// config.requireSecret('ALARM_EMAIL')
