import * as aws from '@pulumi/aws';
import * as awsx from '@pulumi/awsx';
import { DOMAIN } from './config';

const createDns = (apiGateway: awsx.apigateway.API) => {
  const hostedZone = aws.route53.getZone({
    name: DOMAIN,
    privateZone: false,
  });

  const zoneId = hostedZone.then((zone) => zone.zoneId);

  const cert = new aws.acm.Certificate('apiDomainCert', {
    domainName: DOMAIN,
    validationMethod: 'DNS',
  });

  const validationRecords = cert.domainValidationOptions.apply(
    (domainValidationOptions) =>
      domainValidationOptions.map(
        ({
          domainName,
          resourceRecordName,
          resourceRecordType,
          resourceRecordValue,
        }) =>
          new aws.route53.Record(`apiDomainCertValidation-${domainName}`, {
            allowOverwrite: true,
            name: resourceRecordName,
            records: [resourceRecordValue],
            ttl: 60,
            type: resourceRecordType,
            zoneId,
          }),
      ),
  );

  const certValidation = new aws.acm.CertificateValidation(
    'exampleCertificateValidation',
    {
      certificateArn: cert.arn,
      validationRecordFqdns: validationRecords.apply((validationRecord) =>
        validationRecord.map((record) => record.fqdn),
      ),
    },
  );

  const apiDomainName = new aws.apigateway.DomainName('apiDomainName', {
    certificateArn: certValidation.certificateArn,
    domainName: DOMAIN,
  });

  const apiDnsRecord = new aws.route53.Record('apiDnsRecord', {
    zoneId,
    type: 'A',
    name: DOMAIN,
    aliases: [
      {
        name: apiDomainName.cloudfrontDomainName,
        evaluateTargetHealth: false,
        zoneId: apiDomainName.cloudfrontZoneId,
      },
    ],
  });

  const apiBasePathMapping = new aws.apigateway.BasePathMapping(
    'apiBasePathMapping',
    {
      restApi: apiGateway.restAPI,
      stageName: apiGateway.stage.stageName,
      domainName: apiDomainName.domainName,
    },
  );

  return {
    apiDnsRecord,
    apiBasePathMapping,
  };
};

export default createDns;
