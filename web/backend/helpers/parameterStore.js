const AWS = require('aws-sdk');

const ssm = new AWS.SSM({ apiVersion: '2014-11-06' });

const { SSM_PREFIX } = process.env;

const PREFIX = `${SSM_PREFIX}/slack/`;
const prefix = (s) => `${PREFIX}${s}`;

const get = (param) =>
  new Promise((resolve, reject) => {
    ssm.getParameter({ Name: prefix(param) }, (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });

const set = (param, value) =>
  new Promise((resolve, reject) => {
    ssm.putParameter({ Name: prefix(param), Value: value }, (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });

const del = (param) =>
  new Promise((resolve, reject) => {
    ssm.deleteParameter({ Name: prefix(param) }, (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });

module.exports = {
  get,
  set,
  del,
};
