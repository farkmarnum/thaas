import { getInstaller } from '../../../helpers/slack';
import wrapReqRes from '../../../helpers/wrapReqRes';

const handler: Handler = wrapReqRes(async (req, res) => {
  const installer = getInstaller();
  await installer.handleInstallPath(req, res);
});

export default handler;
