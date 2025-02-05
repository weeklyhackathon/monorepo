import Router from 'koa-router';
import { AgentType, initializeAgent, getAgentResponse } from '@weeklyhackathon/agents';
import { log } from '@weeklyhackathon/utils';


export const sendPrizesRouter = new Router({
  prefix: '/api/send-prizes'
});

// POST
sendPrizesRouter.post('/', async (ctx) => {
    log.info('Initializing payment agent');
  try {
    // Handle prizes distribution with the payments agent
    /*
    const inputText = 
      `Distribute the following amount of ${amountEth} eth 
      and ${amountHack} $hackathon as prizes to that list of winners:
      \n${JSON.stringify(winners)}`;
    */
    const inputText = "Distribute the hackathon prizes to the winners.";

    const { agent, config } = await initializeAgent(AgentType.Payment);
    
    if (!agent || config?.agentType !== AgentType.Payment) {
      ctx.status = 200;
      log.info('Could not initialize the payment agent');
      return;      
    }
    
    log.info('Payment agent is ready');
    
    const messages = await getAgentResponse(agent, config, inputText);

    if (!messages) {
      ctx.status = 200;
      log.info('Missing payment agent response');
      return;      
    }
    
    ctx.body = messages;
    return;
  } catch (error) {
    log.error('Error in POST /api/send-prizes');
    log.error(error);
  }  
  
  ctx.status = 200;
  return;  
});
