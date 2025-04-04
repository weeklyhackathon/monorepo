import type { AgentWithConfig } from './types';
import { CdpAgentkit } from '@coinbase/cdp-agentkit-core';
import { CdpToolkit } from '@coinbase/cdp-langchain';
import { MemorySaver } from '@langchain/langgraph';
import { createReactAgent } from '@langchain/langgraph/prebuilt';
//import { ChatOpenAI } from '@langchain/openai';
import { ChatAnthropic } from "@langchain/anthropic";
import { log } from '@weeklyhackathon/utils';
import { validateAgentEnv } from '@weeklyhackathon/utils';
import { hackerAgentPrompt,
  judgeAgentPrompt,
  paymentAgentPrompt,
  messengerAgentPrompt,
  analyzerAgentPrompt 
} from './constants';
import { getSendCastTool, getWinnersPayoutTool, getClaimClankerRewardsTool } from './tools';
import { AgentType, Agent, AgentConfig } from './types';


/**
 * Initialize the agent with CDP Agentkit
 *
 * @returns Agent executor and config
 */
export async function initializeAgent(agentType: AgentType): Promise<AgentWithConfig> {
  if (!validateAgentEnv()) return {};

  try {
    /*
    const llm = new ChatOpenAI({
      apiKey: process.env.OPENAI_API_KEY as string,
      model: 'gpt-4o-mini'
    });
    */
    const llm = new ChatAnthropic({
      apiKey: process.env.OPENAI_API_KEY as string,
      model: "claude-3-5-sonnet-20241022",
    });

    // Get coinbase mpc wallet data from env file
    const walletDataStr: string = process.env.WALLET_DATA_STR || '';
    // Configure CDP Agentkit
    const config = {
      //cdpWalletData: walletDataStr || undefined,
      mnemonicPhrase: process.env.MNEMONIC, // address 0 -> 0x23d788e893cb6b67dBfd0C4280C76464833e7e61
      networkId: process.env.NETWORK_ID || 'base-sepolia'
    };

    // Initialize CDP agentkit
    const agentkit = await CdpAgentkit.configureWithWallet(config);

    // Initialize CDP Agentkit Toolkit and get tools
    const cdpToolkit = new CdpToolkit(agentkit);
    const tools = cdpToolkit.getTools();

    // Add Custom Tools
    if (agentType === AgentType.Payment) {
      // Get an instance of the winners payout tool
      const winnersPayoutTool = getWinnersPayoutTool(agentkit);
      // Get an instance of the claim clanker rewards tool
      const claimClankerRewardsTool = getClaimClankerRewardsTool(agentkit);
      // Add the tools to your toolkit
      tools.push(winnersPayoutTool);
      tools.push(claimClankerRewardsTool);
    }

    if (agentType === AgentType.Messenger) {
      // Get an instance of the send cast tool
      const sendCastTool = getSendCastTool(agentkit);
      // Add the tools to your toolkit
      tools.push(sendCastTool);
    }

    // Store buffered conversation history in memory
    const memory = new MemorySaver();
    const agentConfig = {
      agentType,
      configurable: {
        thread_id: 'WHackathon Agent!'
      }
    };

    // Create React Agent using the LLM and CDP Agentkit tools
    const agent = createReactAgent({
      llm,
      tools,
      checkpointSaver: memory,
      messageModifier:
      agentType === AgentType.Analyzer ? analyzerAgentPrompt :
       agentType === AgentType.Messenger ? messengerAgentPrompt :
         agentType === AgentType.Payment ? paymentAgentPrompt :
           agentType === AgentType.Judge ? judgeAgentPrompt :
             agentType === AgentType.Hacker ? hackerAgentPrompt : ''
    });

    return {
      agent,
      config: agentConfig
    };
  } catch (error) {
    log.error('Failed to initialize agent:', error);
  }
  return {};
}
