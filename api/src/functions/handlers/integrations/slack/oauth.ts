import { getInstaller } from '../../../helpers/slack';
import { Handler } from '../../../../types';
import {
  getLambdaReturnFromResponse,
  getReqResFromLambdaEvent,
} from '../../../helpers/reqRes';

const handler: Handler = async (event) => {
  const { req, res } = getReqResFromLambdaEvent(event);

  const installer = getInstaller();
  await installer.handleCallback(req, res);

  const ret = getLambdaReturnFromResponse({ res });
  console.info(JSON.stringify(ret)); // TODO: REMOVE
  return ret;
};

export default handler;
