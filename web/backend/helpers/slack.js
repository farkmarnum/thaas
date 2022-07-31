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

const handleOAuth = (req, res) => {
  const installer = new InstallProvider({
    clientId: process.env.SLACK_CLIENT_ID,
    clientSecret: process.env.SLACK_CLIENT_SECRET,
    stateSecret: process.env.SLACK_STATE_SECRET,
    logLevel: LogLevel.DEBUG,
    installationStore: {
      storeInstallation: async (installation) => {
        // replace myDB.set with your own database or OEM setter
        if (installation.isEnterpriseInstall) {
          // support for org wide app installation
          return ParameterStore.set(installation.enterprise.id, installation);
        }
        // single team app installation
        return ParameterStore.set(installation.team.id, installation);
      },
      fetchInstallation: async (installQuery) => {
        // replace myDB.get with your own database or OEM getter
        if (
          installQuery.isEnterpriseInstall &&
          installQuery.enterpriseId !== undefined
        ) {
          // org wide app installation lookup
          return ParameterStore.get(installQuery.enterpriseId);
        }
        if (installQuery.teamId !== undefined) {
          // single team app installation lookup
          return ParameterStore.get(installQuery.teamId);
        }
        throw new Error('Failed fetching installation');
      },
      deleteInstallation: async (installQuery) => {
        // replace myDB.get with your own database or OEM getter
        if (
          installQuery.isEnterpriseInstall &&
          installQuery.enterpriseId !== undefined
        ) {
          // org wide app installation deletion
          return ParameterStore.del(installQuery.enterpriseId);
        }
        if (installQuery.teamId !== undefined) {
          // single team app installation deletion
          return ParameterStore.del(installQuery.teamId);
        }
        throw new Error('Failed to delete installation');
      },
    },
  });

  return installer.handleCallback(req, res);
};

module.exports = { handleCommand, handleOAuth };
