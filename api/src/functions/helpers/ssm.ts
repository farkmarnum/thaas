import * as AWS from 'aws-sdk';

AWS.config.logger = console;
const ssm = new AWS.SSM({ apiVersion: '2014-11-06' });

const prefix = (s: string) => {
  const { SSM_PREFIX } = process.env;
  if (!SSM_PREFIX) throw new Error('SSM_PREFIX must be set!');

  const PREFIX = `/${SSM_PREFIX}/slack/`;
  return `${PREFIX}${s}`;
};

export const get = async (param: string): Promise<string | undefined> =>
  (await ssm.getParameter({ Name: prefix(param) }).promise())?.Parameter?.Value;

export const set = async (param: string, value: string) =>
  ssm
    .putParameter({
      Type: 'String',
      Name: prefix(param),
      Value: value,
      Overwrite: true,
    })
    .promise();

export const del = async (param: string) =>
  ssm.deleteParameter({ Name: prefix(param) }).promise();
