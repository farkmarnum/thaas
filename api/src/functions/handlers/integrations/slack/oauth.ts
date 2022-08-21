import { getInstaller } from '../../../helpers/slack';
import wrapReqRes from '../../../helpers/wrapReqRes';
import { Handler } from '../../../../types';

const handler: Handler = async (event, context) =>
  wrapReqRes(async (req, res) => {
    const installer = getInstaller();
    await installer.handleCallback(req, res);
  })(event, context);

export default handler;
