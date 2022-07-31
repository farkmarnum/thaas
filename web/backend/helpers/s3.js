const AWS = require('aws-sdk');

AWS.config.update({ region: 'us-east-1' });

const s3 = new AWS.S3({ apiVersion: '2006-03-01' });

const Bucket = process.env.S3_BUCKET_NAME;

const listObjects = () =>
  new Promise((resolve, reject) => {
    s3.listObjects({ Bucket }, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data.Contents.map(({ Key }) => Key));
      }
    });
  });

const getObject = (key) =>
  new Promise((resolve, reject) => {
    s3.getObject({ Bucket, Key: key }, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data.Body);
      }
    });
  });

module.exports = { listObjects, getObject };
