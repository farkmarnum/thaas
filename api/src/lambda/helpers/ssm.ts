import * as AWS from 'aws-sdk';

const ssm = new AWS.SSM({ apiVersion: '2014-11-06' });

const { SSM_PREFIX } = process.env;
const PREFIX = `${SSM_PREFIX}/slack/`;
const prefix = (s: string) => `${PREFIX}${s}`;

export const get = (param: string): Promise<string | undefined> =>
  new Promise((resolve, reject) => {
    ssm.getParameter({ Name: prefix(param) }, (err, data) => {
      if (err) reject(err);
      else resolve(data?.Parameter?.Value);
    });
  });

export const set = (param: string, value: string) =>
  new Promise<void>((resolve, reject) => {
    ssm.putParameter(
      { Type: 'String', Name: prefix(param), Value: value },
      (err) => {
        if (err) reject(err);
        else resolve();
      },
    );
  });

export const del = (param: string) =>
  new Promise<void>((resolve, reject) => {
    ssm.deleteParameter({ Name: prefix(param) }, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
