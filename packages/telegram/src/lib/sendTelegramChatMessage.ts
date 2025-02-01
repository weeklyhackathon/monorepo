import type { BotToken } from './types';
// @ts-ignore
import telegramFormatter from 'telegramify-markdown';
import { log, POST } from '@weeklyhackathon/utils';
import { getBaseUrl } from './constants';

export async function sendTelegramChatMessage({
  chatId,
  text,
  token,
  url,
  parseMode,
  retrying,
  silent
}: {
	chatId: string | number;
	text: string;
	url?: string;
	parseMode?: 'MarkdownV2';
	retrying?: boolean;
  silent?: boolean;
} & BotToken) {
  try {
    const response = await POST({
      url: `${getBaseUrl({
        token
      })}/sendMessage`,
      headers: {
        'Content-Type': 'application/json'
      },
      body: {
        chat_id: chatId,
        text: parseMode === 'MarkdownV2' ? telegramFormatter(text, 'escape') : text,
        parse_mode: parseMode,
        disable_notification: silent,
        link_preview_options: url
          ? {
            url
          }
          : {
            is_disabled: true
          }
      }
    });

    return response;
  } catch (err: any) {
    log.error('Error sending message Telegram');
    log.error(JSON.stringify({
      err,
      text
    }, null, 2));

    // Only retry once
    if (parseMode && err.error_code === 400 && !retrying) {
      log.info('Reattempting to send message');
      return sendTelegramChatMessage({
        chatId,
        text,
        token,
        parseMode: undefined,
        retrying: true,
        silent
      });
    }

    throw err;
  }
}
