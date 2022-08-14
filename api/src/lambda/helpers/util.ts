import { getObject, listObjects } from './s3';

const { DOMAIN } = process.env;

export const getRandomTomKey = async () => {
  const objects = await listObjects();
  const index = Math.floor(objects.length * Math.random());
  const objectName = objects[index];

  return objectName;
};

export const getRandomTomUrl = async () => {
  const key = await getRandomTomKey();
  return `${DOMAIN}/images/${key}`;
};

export const getRandomTomData = async () => {
  const key = await getRandomTomKey();

  const { body, headers } = await getObject(key);

  return {
    headers,
    body: body.toString(),
  };
};
