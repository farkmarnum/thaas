const S3 = require('aws-sdk/clients/s3');

S3.config.update({ region: 'us-east-1' });
const s3 = new S3({ apiVersion: '2006-03-01' });

const Bucket = process.env.S3_BUCKET_NAME;

const listObjects = () =>
  new Promise((resolve, reject) => {
    s3.listObjects({ Bucket }, (err, data) => {
      if (err) {
        console.error(err);
        reject(err);
      } else {
        resolve(data.Contents.map(({ Key }) => Key));
      }
    });
  });

const streamObject = (key, res) => {
  s3.getObject({ Bucket, Key: key })
    .on('httpHeaders', (_statusCode, headers, response) => {
      res.set('Content-Length', headers['content-length']);
      res.set('Content-Type', headers['content-type']);
      response.httpResponse.createUnbufferedStream().pipe(res);
    })
    .send();
};

module.exports = { listObjects, streamObject };
