const { listObjects } = require('./s3');

const { IMAGES_DOMAIN } = process.env;

const handleCommand = async ({ command }) => {
  if (command !== '/hanks') {
    return {
      response_type: 'ephemeral',
      text: 'Command not found...',
    };
  }

  const objects = await listObjects();
  const index = Math.floor(objects.length * Math.random());
  const objectName = objects[index];

  const imageUrl = `${IMAGES_DOMAIN}/${objectName}`;

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

module.exports = { handleCommand };
