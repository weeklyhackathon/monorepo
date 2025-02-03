import Router from 'koa-router';
import { log } from '@weeklyhackathon/utils';
import { initializeAgent } from '@agents/initializeAgent';
import { getAgentResponse } from '@agents/getAgentResponse';
import { AgentType } from '@agents/types';

export const sendPrizesRouter = new Router({
  prefix: '/api/send-prizes' // All routes will be prefixed with /tasks
});

// POST
sendPrizesRouter.post('/', async (ctx) => {
  const { amountEth, amountHack, winners } = ctx.request.body;
  
  if ((!amountEth && !amountHack) || !winners) {
    ctx.status = 200;
    log.info('Missing required fields');
    return;
  }
  
  try {
    // Handle prizes distribution with the payments agent
    const inputText = 
      `Distribute the following amount of ${amountEth} eth 
      and ${amountHack} $hackathon as prizes to that list of winners:
      \n${JSON.stringify(winners)}`;

    const { agent, config } = await initializeAgent(AgentType.payment);
    
    if (!agent) {
      ctx.status = 200;
      log.info('Could not initialize the payment agent');
      return;      
    }
    
    const messages = await getAgentResponse(agent, config);

    if (!messages) {
      ctx.status = 200;
      log.info('Missing payment agent response');
      return;      
    }
    
    log.log(messages);
    return messages;
  } catch (error) {
    log.error('Error in POST /api/send-prizes');
    log.error(error);
  }  
  
  ctx.status = 200;
  return;  
});
