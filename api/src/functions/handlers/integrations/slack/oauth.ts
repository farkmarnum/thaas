import { getInstaller } from '../../../helpers/slack';
import ReqResMock from '../../../helpers/ReqResMock';
import { Handler } from '../../../../types';

const handler: Handler = async (event) => {
  const { req, res } = ReqResMock(event);

  const installer = getInstaller();
  await installer.handleCallback(req as any, res as any);

  return res.state;
};

export default handler;
