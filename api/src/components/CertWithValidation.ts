import * as aws from '@pulumi/aws';
import * as pulumi from '@pulumi/pulumi';

class CertWithValidation extends pulumi.ComponentResource {
  public zoneId: pulumi.Output<string>;

  public certificateArn: pulumi.Output<string>;

  constructor(
    name: string,
    { domain }: { domain: string },
    opts?: pulumi.ResourceOptions,
  ) {
    if (!name) throw new Error('Missing required arg: name');
    if (!domain) throw new Error('Missing required arg: domain');

    super('custom:CertWithValidation', name);

    const hostedZone = aws.route53.getZone({
      name: domain,
      privateZone: false,
    });

    const zoneId = pulumi.output(hostedZone.then((zone) => zone.zoneId));

    const cert = new aws.acm.Certificate('mainCert', {
      domainName: domain,
      validationMethod: 'DNS',
      subjectAlternativeNames: [`*.${domain}`],
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
      'mainCertValidation',
      {
        certificateArn: cert.arn,
        validationRecordFqdns: validationRecords.apply((validationRecord) =>
          validationRecord.map((record) => record.fqdn),
        ),
      },
      opts,
    );

    const { certificateArn } = certValidation;

    this.zoneId = zoneId;
    this.certificateArn = certificateArn;
  }
}

export default CertWithValidation;
