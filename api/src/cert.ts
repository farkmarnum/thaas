import * as aws from '@pulumi/aws';
import * as pulumi from '@pulumi/pulumi';
import { DOMAIN } from './config';

const createCert = () => {
  const hostedZone = aws.route53.getZone({
    name: DOMAIN,
    privateZone: false,
  });

  const zoneId = pulumi.output(hostedZone.then((zone) => zone.zoneId));

  const cert = new aws.acm.Certificate('apiDomainCert', {
    domainName: DOMAIN,
    validationMethod: 'DNS',
    subjectAlternativeNames: [`*.${DOMAIN}`],
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

  const { certificateArn } = certValidation;

  return {
    zoneId,
    certificateArn,
  };
};

export default createCert;
