import { CdpAgentkit } from "@coinbase/cdp-agentkit-core";
import { CdpToolkit } from "@coinbase/cdp-langchain";
import { MemorySaver } from "@langchain/langgraph";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
//import { ChatAnthropic } from "@langchain/anthropic";
import { judgeAgentPrompt, paymentAgentPrompt } from "./constants";
import { AgentType } from "./types";

/**
 * Initialize the agent with CDP Agentkit
 *
 * @returns Agent executor and config
 */
async function initializeAgent(agentType: AgentType): { agent: any, config?: any } {
  if (!validateEnvironment()) return { agent: undefined };

  try {   
    const llm = new ChatOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      model: "gpt-4o-mini",
    });
    /*
    const llm = new ChatAnthropic({
      apiKey: process.env.OPENAI_API_KEY,
      model: "claude-3-5-sonnet-20241022",
    });
    */

    // Get coinbase mpc wallet data from env file
    let walletDataStr: string = process.env.WALLET_DATA_STR || "";
    // Configure CDP Agentkit
    const config = {
      cdpWalletData: walletDataStr || undefined,
      networkId: process.env.NETWORK_ID || "base-sepolia",
    };

    // Initialize CDP agentkit
    const agentkit = await CdpAgentkit.configureWithWallet(config);

    // Initialize CDP Agentkit Toolkit and get tools
    const cdpToolkit = new CdpToolkit(agentkit);
    const tools = cdpToolkit.getTools();

    // Add Custom Tools
    if (agentType === "payment") {
      // Get an instance of the winners payout tool
      const winnersPayoutTool = getWinnersPayoutTool();
      // Add the tool to your toolkit
      tools.push(winnersPayoutTool);    
    }

    // Store buffered conversation history in memory
    const memory = new MemorySaver();
    const agentConfig = {
      agentType,
      configurable: { thread_id: "Hackathon Agent!" }
    };

    // Create React Agent using the LLM and CDP Agentkit tools
    const agent = createReactAgent({
      llm,
      tools,
      checkpointSaver: memory,
      messageModifier: agentType === "payment" ? 
        paymentAgentPrompt : 
          task === "judge" ? 
            judgeAgentPrompt : ""
    });

    return { agent, config: agentConfig };
  } catch (error) {
    console.log("Failed to initialize agent:", error);
  }
  return { agent: undefined };
}
