import type { BotToken } from './types';
import { GET } from '@weeklyhackathon/utils';
import { getBaseUrl } from './constants';

type TelegramUserProfile = {
	ok: boolean;
	result: {
		id: number;
		first_name: string;
		username: string;
		type: 'private' | 'group' | 'supergroup' | 'channel';
		active_usernames: string[];
		has_private_forwards: boolean;
		max_reaction_count: number;
		accent_color_id: number;
	};
};

export async function getTelegramChat({
  chatId,
  token
}: { chatId: number } & BotToken): Promise<TelegramUserProfile['result']> {
  const {
    ok, result
  } = await GET<TelegramUserProfile>({
    url: `${getBaseUrl({
      token
    })}/getChat`,
    query: {
      chat_id: chatId
    }
  });

  if (!ok) {
    throw new Error(`Failed to fetch telegram chat id ${chatId}`);
  }

  return result;
}
