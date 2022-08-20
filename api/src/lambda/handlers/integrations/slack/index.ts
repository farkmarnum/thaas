import * as url from 'url';
import { getRandomTomUrl } from '../../../helpers/tom';

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

  return {
    response_type: 'in_channel',
    blocks: [
      {
        type: 'image',
        image_url: imageUrl,
        alt_text: 'Tom Hanks',
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
