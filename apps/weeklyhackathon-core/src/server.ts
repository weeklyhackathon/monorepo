import cors from '@koa/cors'; // CORS middleware
import koa from 'koa';
import koaBody from 'koa-bodyparser';
import { env, log } from '@weeklyhackathon/utils';
import { authRouter } from './api/auth';
import { telegramChatRouter } from './api/chat-telegram';
import { processSubmissionsRouter } from './api/process-submission';
import { sendPrizesRouter } from './api/send-prizes';
import { uploadSubmissionsRouter } from './api/upload-submissions';
import { healthRouter } from './health';

export const app = new koa();

// Global Error Handler
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err: any) {
    log.error(`API Error:\r\n${JSON.stringify(err, null, 2)}`); // Log error for debugging
    ctx.status = err.status || 500;
    ctx.body = {
      message: err.message || 'Internal Server Error'
    };
  }
});

app.use(
  cors({
    origin: process.env.ALLOWED_ORIGIN ?? '*',
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'Accept', 'x-api-key'],
    credentials: true
  })
);

// JSON Parser Middleware
app.use(koaBody());

app.use(healthRouter.routes());

// Global API Key Middleware -----------------
app.use(async (ctx, next) => {
  const requestApiKey =
    ctx.headers['x-api-key'] || ctx.query.apiKey || ctx.query.api_key;

  if (!env.APP_API_KEY) {
    ctx.body = {
      error: 'Weekly Hackathon API Key not configured in the server'
    };
    ctx.status = 500; // Internal Server
    return;
  }

  if (requestApiKey !== env.APP_API_KEY) {
    ctx.status = 401; // Forbidden
    ctx.body = {
      error: 'Forbidden: Invalid API Key'
    };
    return;
  }

  await next(); // Continue to next middleware or route if API key is valid
});

app.use(telegramChatRouter.routes());
app.use(authRouter.routes());
app.use(processSubmissionsRouter.routes());
app.use(sendPrizesRouter.routes());
app.use(uploadSubmissionsRouter.routes());
