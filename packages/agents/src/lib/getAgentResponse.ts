/**
 * Get the agent response
 *
 * @param agent - The agent to get the response of
 * @param config - Agent configuration
 * @param input - The input for the agent
 */
async function getAgentResponse(agent: any, config: any, input: string): Promise<any[]> {
  try {
    const stream = await agent.stream(
      { messages: [new HumanMessage(input)] },
      config
    );

    const agentResponses = [];

    for await (const chunk of stream) {
      if ("agent" in chunk) {
        agentResponses.push(chunk.agent.messages[0].content);
      } else if ("tools" in chunk) {
        agentResponses.push(chunk.tools.messages[0].content);
      }
    }
    
    console.log(agentResponses);
    
    return agentResponses;
  } catch (error) {
    if (error instanceof Error) {
      console.log("Error:", error.message);
    }
  }
  return [];
}
