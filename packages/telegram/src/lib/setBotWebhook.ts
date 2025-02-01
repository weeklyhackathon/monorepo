import type { BotToken } from './types';
import { POST, env } from '@weeklyhackathon/utils';
import { getBaseUrl } from './constants';

export async function setTelegramBotWebhook({
  token,
  webhookUrl
}: Required<BotToken> & { webhookUrl: string }) {
  const domain = process.env.DOMAIN;

  if (!domain) {
    throw new Error('DOMAIN environment variable not set');
  }

  const url = `${getBaseUrl({
    token
  })}/setWebhook?url=${encodeURIComponent(webhookUrl)}?api_key=${encodeURIComponent(env.APP_API_KEY)}`;


  await POST({
    url,
    headers: {
      'Content-Type': 'application/json'
    }
  });
}
