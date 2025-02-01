import type { BotToken } from './types';

export const telegramApiBaseUrl = 'https://api.telegram.org';

export function getBaseUrl({
  token, path
}: BotToken & { path?: string }): string {
  return `${telegramApiBaseUrl}/bot${token}${path ?? ''}`;
}
