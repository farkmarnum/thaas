import { InstallProvider, LogLevel } from '@slack/oauth';
import * as SSM from './ssm';

const { SLACK_CLIENT_ID, SLACK_CLIENT_SECRET, SLACK_STATE_SECRET } =
  process.env;

if (!SLACK_CLIENT_ID) throw new Error('SLACK_CLIENT_ID must be set!');
if (!SLACK_CLIENT_SECRET) throw new Error('SLACK_CLIENT_SECRET must be set!');
if (!SLACK_STATE_SECRET) throw new Error('SLACK_STATE_SECRET must be set!');

export const getInstaller = () =>
  new InstallProvider({
    clientId: SLACK_CLIENT_ID,
    clientSecret: SLACK_CLIENT_SECRET,
    stateSecret: SLACK_STATE_SECRET,
    logLevel: LogLevel.DEBUG,
    installationStore: {
      storeInstallation: async (installation) => {
        const value = JSON.stringify(installation);

        if (installation.isEnterpriseInstall && installation?.enterprise?.id) {
          return SSM.set(installation.enterprise.id, value);
        }
        if (installation?.team?.id) {
          return SSM.set(installation.team.id, value);
        }

        throw new Error('Failed to store installation.');
      },
      fetchInstallation: async (installQuery) => {
        let value;

        if (
          installQuery.isEnterpriseInstall &&
          installQuery.enterpriseId !== undefined
        ) {
          value = await SSM.get(installQuery.enterpriseId);
        }

        if (installQuery.teamId !== undefined) {
          value = await SSM.get(installQuery.teamId);
        }

        if (!value) {
          throw new Error('Failed to fetch installation.');
        }

        return JSON.parse(value);
      },
      deleteInstallation: async (installQuery) => {
        if (
          installQuery.isEnterpriseInstall &&
          installQuery.enterpriseId !== undefined
        ) {
          return SSM.del(installQuery.enterpriseId);
        }

        if (installQuery.teamId !== undefined) {
          return SSM.del(installQuery.teamId);
        }

        throw new Error('Failed to delete installation');
      },
    },
    installUrlOptions: {
      scopes: ['commands', 'chat:write', 'chat:write.public'],
    },
  });
