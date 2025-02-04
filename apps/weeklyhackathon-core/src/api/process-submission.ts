import Router from 'koa-router';
import { AgentType, initializeAgent, getAgentResponse } from '@weeklyhackathon/agents';
import { log } from '@weeklyhackathon/utils';
import { ProcessSubmissionParams } from '@weeklyhackathon/agents'; 


export const sendPrizesRouter = new Router({
  prefix: '/api/process-submission' // All routes will be prefixed with /tasks
});

// POST
sendPrizesRouter.post('/', async (ctx) => {
  const { submission } = ctx.request.body as ProcessSubmissionParams;
  
  if (!submission) {
    ctx.status = 200;
    log.info('Missing required fields');
    return;
  }
  
  try {
    // Handle summarize submission with the hacker agent 
    const inputText = 
      `Write the most wonderful summary highlighting the features of the following flat file of a git pull request
      \n${submission.flatFilePR}`;

    const { agent: hackerAgent, config: hackerConfig } = await initializeAgent(AgentType.Hacker);
    
    if (!hackerAgent || hackerConfig?.agentType !== AgentType.Hacker) {
      ctx.status = 200;
      log.info('Could not initialize the hacker agent');
      return;      
    }
    
    const hackerMessages = await getAgentResponse(hackerAgent, hackerConfig, inputText);

    if (!hackerMessages) {
      ctx.status = 200;
      log.info('Missing hacker agent response');
      return;      
    }

    log.log(hackerMessages);
    // Handle judge submission with the judge agent     
    
    const { agent: judgeAgent, config: judgeConfig  } = await initializeAgent(AgentType.Judge); 

    if (!judgeAgent || judgeConfig?.agentType !== AgentType.Judge) {
      ctx.status = 200;
      log.info('Could not initialize the hacker agent');
      return;      
    }

    const judgeMessages = await getAgentResponse(judgeAgent, judgeConfig, JSON.stringify(hackerMessages));       
    
    return judgeMessages;
  } catch (error) {
    log.error('Error in POST /api/send-prizes');
    log.error(error);
  }  
  
  ctx.status = 200;
  return;  
});
