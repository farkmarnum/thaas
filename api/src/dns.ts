import * as pulumi from '@pulumi/pulumi';
import * as aws from '@pulumi/aws';
import * as awsx from '@pulumi/awsx';
import { DOMAIN } from './config';

const createDns = ({
  apiGateway,
  zoneId,
  certificateArn,
}: {
  apiGateway: awsx.apigateway.API;
  zoneId: pulumi.Output<string>;
  certificateArn: pulumi.Output<string>;
}) => {
  const stackName = pulumi.getStack();
  const apiDomain = `${stackName}.${DOMAIN}`;
  const apiDomainName = new aws.apigateway.DomainName('apiDomainName', {
    certificateArn,
    domainName: apiDomain,
  });

  const apiDnsRecord = new aws.route53.Record('apiDnsRecord', {
    zoneId,
    type: 'A',
    name: apiDomain,
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
