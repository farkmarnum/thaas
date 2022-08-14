import { getObject, listObjects } from './s3';

export const getRandomTomKey = async () => {
  const objects = await listObjects();
  const index = Math.floor(objects.length * Math.random());
  const objectName = objects[index];

  return objectName;
};

export const getRandomTomUrl = async () => {
  const { DOMAIN } = process.env;
  if (!DOMAIN) throw new Error('DOMAIN must be set!');

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
