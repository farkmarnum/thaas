import { getObject, listObjects } from './s3';

const getRandomTomKey = async () => {
  let keys = await listObjects();

  // This bucket has static site files in it too, so filter it to just the keys in the images/ directory
  keys = keys.filter((k) => k.match(/[^/]+\/images\/./));

  const index = Math.floor(keys.length * Math.random());
  return keys[index];
};

export const getRandomTomUrl = async () => {
  const { DOMAIN } = process.env;
  if (!DOMAIN) throw new Error('DOMAIN must be set!');

  const key = await getRandomTomKey();
  const keyWithoutPrefix = key.replace(/[^/]+\/images\//, '');

  return `https://${DOMAIN}/images/${keyWithoutPrefix}`;
};

export const getRandomTomData = async () => {
  const key = await getRandomTomKey();
  const { body, headers } = await getObject(key);

  return {
    headers,
    body,
  };
};
