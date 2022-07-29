import * as core from '@actions/core';
import handleTrigger from './handleTrigger';
import callApi from './callApi';
import createComment from './createComment';

export const main = async () => {
  await handleTrigger();

  const image = await callApi();

  await createComment(image);
};

async function run(): Promise<void> {
  try {
    await main();
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message);
  }
};

run();
