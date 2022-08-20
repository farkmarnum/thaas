import { getInstaller } from '../../../helpers/slack';
import ReqResMock from '../../../helpers/ReqResMock';

const handler: Handler = async (event) => {
  const { req, res } = ReqResMock({
    path: event.path,
    headers: event.headers,
  });

  const installer = getInstaller();
  await installer.handleCallback(req as any, res as any);

  return res.state;
};

export default handler;
