import Router from 'koa-router';

export const healthRouter = new Router({
  prefix: '/health'
});

// GET /tasks
healthRouter.get('/', async (ctx) => {
  ctx.body = {
    message: 'Alive and well',
    uptime: `${Math.floor(process.uptime()).toLocaleString()}s`
  };

  ctx.status = 200;
});
