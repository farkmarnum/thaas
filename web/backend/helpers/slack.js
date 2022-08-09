const { InstallProvider, LogLevel } = require('@slack/oauth');
const ParameterStore = require('./parameterStore');
const getTom = require('./getTom');

const handleCommand = async ({ command }) => {
  if (command !== '/hanks') {
    return {
      response_type: 'ephemeral',
      text: 'Command not found...',
    };
  }

  const imageUrl = await getTom();

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
      const value = JSON.stringify(installation);

      if (installation.isEnterpriseInstall) {
        return ParameterStore.set(installation.enterprise.id, value);
      }
      return ParameterStore.set(installation.team.id, value);
    },
    fetchInstallation: async (installQuery) => {
      let value;

      if (
        installQuery.isEnterpriseInstall &&
        installQuery.enterpriseId !== undefined
      ) {
        value = await ParameterStore.get(installQuery.enterpriseId);
      }

      if (installQuery.teamId !== undefined) {
        value = await ParameterStore.get(installQuery.teamId);
      }

      if (!value) {
        throw new Error('Failed fetching installation');
      }

      return JSON.parse(value);
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
  installUrlOptions: {
    scopes: ['commands', 'chat:write', 'chat:write.public'],
  },
});

const handleSlackOAuth = async (req, res) => installer.handleCallback(req, res);

const handleSlackInstall = async (req, res) =>
  installer.handleInstallPath(req, res);

module.exports = { handleCommand, handleSlackOAuth, handleSlackInstall };
