import { Abi, createPublicClient, createWalletClient, decodeEventLog, http, parseEther } from 'viem'
import { base } from 'viem/chains'
import { privateKeyToAccount } from 'viem/accounts'
import { CdpTool } from "@coinbase/cdp-langchain";
import { Agent } from "../types";
import { hackathonAddress, hackathonSymbol } from "../constants";
import { log } from "@weeklyhackathon/utils";
import { z } from "zod";

// Define the prompt for the winners payout tool
const CLAIM_REWARDS_PROMPT = "Call the 'claimRewards' function to claim the trading fees of the hackathon token to fund the hackathon prizes.";

const ClaimRewardsInput = z.object({});
type ClaimRewardsSchema = z.infer<typeof ClaimRewardsInput>;

const clankerRewardsAddress = "0x732560fa1d1A76350b1A500155BA978031B53833";
const claimRewardsAbi: Abi = [
  {
    "inputs": [{"name": "token","type": "address"}],
    "name": "claimRewards",
    "type": "function",
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "event",
    "name": "ClaimedRewards",
    "inputs": [
      {"name": "claimer", "type": "address", "indexed": true},
      {"name": "token0", "type": "address", "indexed": true},
      {"name": "token1", "type": "address", "indexed": true},
      {"name": "amount0", "type": "uint256", "indexed": false},
      {"name": "amount1", "type": "uint256", "indexed": false},
      {"name": "totalAmount1", "type": "uint256", "indexed": false},
      {"name": "totalAmount0", "type": "uint256", "indexed": false}
    ]
  }
] as const;

interface ClaimedRewardsLog {
  claimer: string;
  token0: string;
  token1: string;
  amount0: bigint;
  amount1: bigint;
  totalAmount1: bigint;
  totalAmount0: bigint;
}

/**
 * Claim clanker rewards of the hackathon token
 *
 * @returns A formatted string containing the summary of the operation
 */
async function claimClankerRewards(args: ClaimRewardsSchema): Promise<string> {
  // Configure Base chain connection
  const publicClient = createPublicClient({
    chain: base,
    transport: http('https://mainnet.base.org')
  });

  const account = privateKeyToAccount(process.env.PK as `0x${string}`);

  const walletClient = createWalletClient({
    account,
    chain: base,
    transport: http('https://mainnet.base.org')
  });

  try {
    const { request } = await publicClient.simulateContract({
      address: clankerRewardsAddress,
      abi: claimRewardsAbi,
      functionName: 'claimRewards',
      args: [hackathonAddress],
      account
    });     
    
    const txHash = await walletClient.writeContract(request);
    const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });

    const claimedEvent = receipt.logs
      .map(log => decodeEventLog({ 
        abi: claimRewardsAbi, data: log.data, topics: log.topics 
      }))
      .find(e => e.eventName === 'ClaimedRewards');
    const claimArgs = claimedEvent?.args as unknown as ClaimedRewardsLog;
    const amountHack = claimArgs.amount0 || 0;
    const amountEth = claimArgs.amount1 || 0;

    const summary =
      "Claim Rewards Summary:\n" +
      "============================\n" +
      `Total Eth Claimed: ${amountEth}\n` +
      `Total Hackathon Claimed: ${amountHack}\n` +
      "============================\n" +
      `\nSuccess: Clanker Rewards successfuly claimed.` +
      `\nTransaction Hash: ${txHash}` +
      `\nTransaction Link: https://basescan.org/tx/${txHash}\n`;
    log.info(summary);
    return summary;
  } catch (error) {
    log.error(error);
  }
  return `Error: Could not claim clanker rewards.`
}

export function getClaimClankerRewardsTool(agentkit: Agent) {
  // Create the CdpTool instance
  return new CdpTool(
    {
      name: "claim_clanker_rewards",
      description: CLAIM_REWARDS_PROMPT,
      argsSchema: ClaimRewardsInput,
      func: claimClankerRewards
    },
    agentkit
  );
};
