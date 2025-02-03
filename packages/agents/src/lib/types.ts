import { Agentkit, AgentKitOptions } from "@coinbase/cdp-agentkit-core";

export enum AgentType {
  Judge = "judge",
  Hacker = "hacker",
  Payment = "payment"
}

export type Agent = typeof Agentkit;
export type AgentConfig = { agentType: AgentType; configurable: { thread_id: string } };
export type AgentWithConfig = { agent: Agent, config?: AgentConfig };

export type Winner = {
  address: string;
  shares: string;
  amount?: Number;
}
