const { InstallProvider, LogLevel } = require('@slack/oauth');

const ParameterStore = require('./parameterStore');
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

const installer = new InstallProvider({
  clientId: process.env.SLACK_CLIENT_ID,
  clientSecret: process.env.SLACK_CLIENT_SECRET,
  stateSecret: process.env.SLACK_STATE_SECRET,
  logLevel: LogLevel.DEBUG,
  installationStore: {
    storeInstallation: async (installation) => {
      if (installation.isEnterpriseInstall) {
        return ParameterStore.set(installation.enterprise.id, installation);
      }
      return ParameterStore.set(installation.team.id, installation);
    },
    fetchInstallation: async (installQuery) => {
      if (
        installQuery.isEnterpriseInstall &&
        installQuery.enterpriseId !== undefined
      ) {
        return ParameterStore.get(installQuery.enterpriseId);
      }
      if (installQuery.teamId !== undefined) {
        return ParameterStore.get(installQuery.teamId);
      }
      throw new Error('Failed fetching installation');
    },
    deleteInstallation: async (installQuery) => {
      if (
        installQuery.isEnterpriseInstall &&
        installQuery.enterpriseId !== undefined
      ) {
        return ParameterStore.del(installQuery.enterpriseId);
      }
      if (installQuery.teamId !== undefined) {
        return ParameterStore.del(installQuery.teamId);
      }
      throw new Error('Failed to delete installation');
    },
  },
});

const handleSlackOAuth = async (req, res) => installer.handleCallback(req, res);

const handleSlackInstall = async (req, res) =>
  installer.handleInstallPath(req, res, {
    scopes: ['commands', 'chat:write', 'chat:write.public'],
  });

module.exports = { handleCommand, handleSlackOAuth, handleSlackInstall };
