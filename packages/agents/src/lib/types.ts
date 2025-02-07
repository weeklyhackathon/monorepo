import { AgentKitOptions } from "@coinbase/agentkit";
import { Address } from "viem"; 
import { EnrichedPullRequest } from '@weeklyhackathon/github'; 

export enum AgentType {
  Judge = "judge",
  Hacker = "hacker",
  Payment = "payment",
  Messenger = "messenger"
}

export type Agent = any;
export type AgentConfig = { agentType: AgentType; configurable: { thread_id: string } };
export type AgentWithConfig = { agent?: Agent, config?: AgentConfig };

export type Winner = {
  address?: Address;
  shares: number;
  amount?: number;
}

export type SendPrizeParams = { 
  amountEth: string, 
  amountHack: string, 
  winners: Winner[] 
}

export type ProcessSubmissionParams = {
  submission: EnrichedPullRequest
}

export type Submission = {
  id: string;
  hackerAgentResponse?: string;
  flatFilePR: string;
}

export type ClaimedRewardsLog = {
  claimer: string;
  token0: string;
  token1: string;
  amount0: bigint;
  amount1: bigint;
  totalAmount1: bigint;
  totalAmount0: bigint;
}
