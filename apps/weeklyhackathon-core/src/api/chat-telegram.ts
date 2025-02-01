
import type { IncomingTelegramMessage } from '@weeklyhackathon/telegram';
import Router from 'koa-router';
import { sendTelegramChatMessage, setTelegramTyping } from '@weeklyhackathon/telegram';
import { env, log, sleep } from '@weeklyhackathon/utils';

export const telegramChatRouter = new Router({
  prefix: '/api/chat-telegram' // All routes will be prefixed with /tasks
});

// POST
telegramChatRouter.post('/', async (ctx) => {
  const incomingMessage = ctx.request.body as IncomingTelegramMessage;

  if (!incomingMessage.message) {
    ctx.status = 200;
    log.info('No message body found in incoming message');
    return;
  }

  if (incomingMessage.message.chat.id !== incomingMessage.message.from.id) {
    ctx.status = 200;
    log.info('Message is not inside a private chat');
    return;
  }

  try {

    // Handle messages
    const messageText = incomingMessage.message?.text || '';

    await setTelegramTyping({
      chatId: incomingMessage.message.chat.id,
      token: env.TELEGRAM_BOT_TOKEN
    });

    await sleep();


    await sendTelegramChatMessage({
      chatId: incomingMessage.message.chat.id,
      text: `Hello, I'm the Weekly Hackathon bot. How can I help you today?\r\nHere is your message: ${messageText}`,
      token: env.TELEGRAM_BOT_TOKEN
    });

  } catch (error) {
    log.error('Error in POST /api/chat-telegram');
    log.error(error);
  }

  ctx.status = 200;
  return;

});
