const { listObjects } = require('./s3');

export const getRandomTomKey = async () => {
  const objects = await listObjects();
  const index = Math.floor(objects.length * Math.random());
  const objectName = objects[index];

  return objectName;
};
