import { setTelegramBotWebhook } from '@weeklyhackathon/telegram';
//import { createSchema, writeToNodes, readFromNodes } from '@weeklyhackathon/agents/nillionVault';
import { log, env } from '@weeklyhackathon/utils';
import { startCronJobs, startDemo } from './cron';
import { app } from './server';

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3000;


app.listen(port, host, () => {
  log.info(`[ ready ] http://${host}:${port}`);
});


startCronJobs();


configureBot();


startDemo();

/// must run this once to set up the nillion vault
/// create the schema and write the PK secret in the vault
/// (it was already done, just ignore it)
//createSchema();
//writeToNodes();

async function configureBot() {
  const webhookUrl = `${env.DOMAIN}/api/chat-telegram`;

  log.info(`Setting Telegram bot webhook to ${webhookUrl}`);

  await setTelegramBotWebhook({
    token: env.TELEGRAM_BOT_TOKEN,
    webhookUrl
  });

  log.info(`Telegram bot webhook set to ${webhookUrl}`);

  log.info('Bot configuration complete');
}
