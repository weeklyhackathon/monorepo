import type { BotToken } from './types';
import { GET } from '@weeklyhackathon/utils';
import { getBaseUrl } from './constants';

export async function setTelegramTyping({
  chatId, token
}: { chatId: number } & BotToken): Promise<void> {
  await GET({
    url: `${getBaseUrl({
      token
    })}/sendChatAction`,
    query: {
      chat_id: chatId,
      action: 'typing'
    }
  });
}
