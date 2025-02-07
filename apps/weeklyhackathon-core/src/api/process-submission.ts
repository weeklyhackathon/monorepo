import Router from 'koa-router';
import { AgentType, initializeAgent, getAgentResponse } from '@weeklyhackathon/agents';
import { log } from '@weeklyhackathon/utils';
import { ProcessSubmissionParams } from '@weeklyhackathon/agents'; 

export const processSubmissionsRouter = new Router({
  prefix: "/api/process-submission",
});

// POST
processSubmissionsRouter.post("/", async (ctx) => {
  const { submission } = ctx.request.body as ProcessSubmissionParams;

  if (!submission) {
    ctx.status = 200;
    log.info("Missing required fields");
    return;
  }

  log.info("Summarizing current submission");
  log.log(submission);

  try {
    // Handle summarize submission with the hacker agent 
    const inputText = 
      `Write the most wonderful summary highlighting the features of the following diff file of a git pull request (don't use  tools)
      \n${submission.diff}`;

    const { agent: hackerAgent, config: hackerConfig } = await initializeAgent(
      AgentType.Hacker
    );

    if (!hackerAgent || hackerConfig?.agentType !== AgentType.Hacker) {
      ctx.status = 200;
      log.info("Could not initialize the hacker agent");
      return;
    }

    const hackerMessages = await getAgentResponse(
      hackerAgent,
      hackerConfig,
      inputText
    );

    if (!hackerMessages) {
      ctx.status = 200;
      log.info("Missing hacker agent response");
      return;
    }

    // Handle judge submission with the judge agent
    const { agent: judgeAgent, config: judgeConfig } = await initializeAgent(
      AgentType.Judge
    );

    if (!judgeAgent || judgeConfig?.agentType !== AgentType.Judge) {
      ctx.status = 200;
      log.info("Could not initialize the hacker agent");
      return;
    }
    
    const enrichedHackerSubmission =     
      "CONTEXT START· Project Repository" + "\n========\n" +      
      "Repository Context · Product Description" + "\n========\n" 
      + JSON.stringify(submission.repo.productDescription) + "\n\n" +      
      "Repository Context · Technical Architecture" + "\n========\n" 
      + JSON.stringify(submission.repo.technicalArchitecture) + "\n\n" +   
      "CONTEXT END" + "\n========\n\n" +     
      
      "Hacker Submission START" + "\n========\n" +
      "Hacker Intro" + "\n========\n" 
      + JSON.stringify(hackerMessages) + "\n\n" +
      "Hacker Pull Request · Product Description" + "\n========\n" 
      + JSON.stringify(submission.pullRequest.productAnalysis) + "\n\n" +
      "Hacker Pull Request · Technical Architecture" + "\n========\n" 
      + JSON.stringify(submission.pullRequest.technicalArchitecture) + "\n\n" +
      "Hacker Pull Request · Diff file (only relevant changes)" + "\n========\n" 
      + JSON.stringify(submission.diff) + "\n\n" +      
      "Hacker Submission END";

    const judgeMessages = await getAgentResponse(
      judgeAgent, 
      judgeConfig,
      enrichedHackerSubmission
    );

    ctx.body = judgeMessages[0];
    return;
  } catch (error) {
    log.error("Error in POST /api/send-prizes");
    log.error(error);
  }

  ctx.status = 200;
  return;
});
