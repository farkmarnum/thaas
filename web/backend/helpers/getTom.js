const { listObjects } = require('./s3');

const { IMAGES_DOMAIN } = process.env;

const getTom = async () => {
  const objects = await listObjects();
  const index = Math.floor(objects.length * Math.random());
  const objectName = objects[index];

  const imageUrl = `${IMAGES_DOMAIN}/${objectName}`;

  return imageUrl;
};

module.exports = getTom;
