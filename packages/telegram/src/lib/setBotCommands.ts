import type { BotToken } from './types';
import { POST, log } from '@weeklyhackathon/utils';
import { getBaseUrl } from './constants';

export type MenuCommand = {
	command: string;
	description: string;
};

type MenuConfiguration = {
	commands: MenuCommand[];
};

type ScopeType = 'default' | 'all_private_chats' | 'all_group_chats' | 'all_chat_administrators' | 'chat' | 'chat_administrators' | 'chat_member';

type CommandScope = {
  type: ScopeType;
  chat_id?: number;
};

/**
 * Further info about command scopes:
 * https://core.telegram.org/bots/api#botcommandscope
 *
 * API Endpoint: https://core.telegram.org/bots/api#setmycommands
 */
export async function setBotCommands({
  token, configuration, scope
}: BotToken & { configuration: MenuConfiguration; scope?: CommandScope }) {
  await POST({
    url: getBaseUrl({
      token,
      path: '/setMyCommands'
    }),
    body: {
      commands: configuration.commands,
      scope
    }
  });

  if (scope?.type === 'chat') {
    log.info(`Commands Set for user ${scope.chat_id}:`, configuration.commands.map((c) => c.command).join(', '));
  } else {
    log.info('Global Commands Set:', configuration.commands.map((c) => c.command).join(', '));
  }

}
