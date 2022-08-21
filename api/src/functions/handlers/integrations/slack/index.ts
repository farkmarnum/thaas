import * as url from 'url';
import { getRandomTomUrl } from '../../../helpers/tom';
import { Handler } from '../../../../types';

const handleCommand = async ({
  command,
}: {
  command: string | string[] | undefined;
}) => {
  if (command !== '/hanks') {
    return {
      response_type: 'ephemeral',
      text: 'Command not found...',
    };
  }

  const imageUrl = await getRandomTomUrl();

  const { DOMAIN } = process.env;
  if (!DOMAIN) throw new Error('DOMAIN must be set!');
  const HOMEPAGE = `https://${DOMAIN}`;

  const text = `ᴵ ᵃᵐ ᵃ <${HOMEPAGE}|ᵇᵒᵗ> ʳᵉˢᵖᵒⁿᵈᶦⁿᵍ ᵗᵒ ᵗʰᵉ ʰᵃⁿᵏˢ ˢˡᵃˢʰ ᶜᵒᵐᵐᵃⁿᵈ`;

  return {
    response_type: 'in_channel',
    blocks: [
      {
        type: 'image',
        image_url: imageUrl,
        alt_text: 'Tom Hanks',
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text,
        },
      },
    ],
  };
};

const handler: Handler = async (event) => {
  const paramString = Buffer.from(event.body || '', 'base64').toString('ascii');
  const paramsParsed = url.parse(`example.com/?${paramString}`, true).query;

  const { command } = paramsParsed;
  const body = await handleCommand({ command });

  return {
    statusCode: 200,
    body: JSON.stringify(body),
  };
};

export default handler;
