import { HumanMessage } from "@langchain/core/messages";
import { log } from "@weeklyhackathon/utils";
import { Agent, AgentConfig } from "@weeklyhackathon/agents";
/**
 * Get the agent response
 *
 * @param agent - The agent to get the response of
 * @param config - Agent configuration
 * @param input - The input for the agent
 */
export async function getAgentResponse(agent: Agent, config: AgentConfig, input: string): Promise<any[]> {
  try {
    const stream = await agent.stream(
      { messages: [new HumanMessage(input)] },
      config
    );

    const agentResponses = [];

    for await (const chunk of stream) {
      if ("agent" in chunk) {
        const content = chunk.agent.messages[0].content;
        
        if (typeof content === "string") {
          agentResponses.push(content);
        } else if (Array.isArray(content)) {
          for (const c of content) {
            if (c?.text) agentResponses.push(c.text);
          }          
        }
      
        //agentResponses.push(chunk.agent.messages[0].content);
      } else if ("tools" in chunk) {
        const content = chunk.tools.messages[0].content;
        
        if (typeof content === "string") {
          agentResponses.push(content);
        } else if (Array.isArray(content)) {
          for (const c of content) {
            if (c?.text) agentResponses.push(c.text);
          }          
        }
        
        //agentResponses.push(chunk.tools.messages[0].content);
      }
    }
    
    
    log.log(agentResponses.join("\n"));
    
    return agentResponses;
  } catch (error) {
    if (error instanceof Error) {
      log.error("Error:", error.message);
    }
  }
  return [];
}
