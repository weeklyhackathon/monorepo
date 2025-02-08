import type { Agent, ClaimedRewardsLog } from '../types';
import type { Abi } from 'viem';
import { CdpTool } from '@coinbase/cdp-langchain';
import { createPublicClient, createWalletClient, decodeEventLog, http, parseEther } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { base, baseSepolia } from 'viem/chains';
import { z } from 'zod';
import { readFromNodes } from '@weeklyhackathon/agents/nillionVault';
import { log } from '@weeklyhackathon/utils';
import { hackathonAddress, hackathonSymbol } from '../constants';

// Define the prompt for the winners payout tool
const CLAIM_REWARDS_PROMPT = 'Call the \'claimRewards\' function to claim the trading fees of the hackathon token from the clanker platform to fund the hackathon prizes. Use it before prizes distribution.';

const ClaimRewardsInput = z.object({});
type ClaimRewardsSchema = z.infer<typeof ClaimRewardsInput>;

const clankerRewardsAddress = process.env.NETWORK_ID === 'base-mainnet' ? '0x901776E42A8286525849c67825c758ddbB1d94F7' : '0x732560fa1d1A76350b1A500155BA978031B53833';
const claimRewardsAbi: Abi = [
  {
    'inputs': [{
      'name': 'token',
      'type': 'address'
    }],
    'name': 'claimRewards',
    'type': 'function',
    'outputs': [],
    'stateMutability': 'nonpayable'
  }
] as const;
const claimedRewardsEventAbi: Abi = [
  {
    'anonymous': false,
    'inputs': [
      {
        'indexed': true,
        'internalType': 'address',
        'name': 'claimer',
        'type': 'address'
      },
      {
        'indexed': true,
        'internalType': 'address',
        'name': 'token0',
        'type': 'address'
      },
      {
        'indexed': true,
        'internalType': 'address',
        'name': 'token1',
        'type': 'address'
      },
      {
        'indexed': false,
        'internalType': 'uint256',
        'name': 'amount0',
        'type': 'uint256'
      },
      {
        'indexed': false,
        'internalType': 'uint256',
        'name': 'amount1',
        'type': 'uint256'
      },
      {
        'indexed': false,
        'internalType': 'uint256',
        'name': 'totalAmount1',
        'type': 'uint256'
      },
      {
        'indexed': false,
        'internalType': 'uint256',
        'name': 'totalAmount0',
        'type': 'uint256'
      }
    ],
    'name': 'ClaimedRewards',
    'type': 'event'
  }
] as const;


/**
 * Claim clanker rewards of the hackathon token
 *
 * @returns A formatted string containing the summary of the operation
 */
async function claimClankerRewards(args: ClaimRewardsSchema): Promise<string> {
  log.info('Claiming hackathon/weth token pair fees from clanker contract');
  // Configure Base chain connection
  const publicClient = createPublicClient({
    chain: baseSepolia,
    transport: process.env.NETWORK_ID === 'base-mainnet' ? http('https://mainnet.base.org') : http('https://sepolia.base.org')
  });

  const account = privateKeyToAccount(await readFromNodes() as `0x${string}`);

  const walletClient = createWalletClient({
    account,
    chain: baseSepolia,
    transport: process.env.NETWORK_ID === 'base-mainnet' ? http('https://mainnet.base.org') : http('https://sepolia.base.org')
  });

  try {
    const {
      request
    } = await publicClient.simulateContract({
      address: clankerRewardsAddress,
      abi: claimRewardsAbi,
      functionName: 'claimRewards',
      args: [hackathonAddress],
      account
    });

    const txHash = await walletClient.writeContract(request);
    const receipt = await publicClient.waitForTransactionReceipt({
      hash: txHash
    });

    let claimArgs: ClaimedRewardsLog | undefined;
    try {
      const claimedEvent = receipt.logs
        .map(log => decodeEventLog({
          abi: claimedRewardsEventAbi,
          data: log.data,
          topics: log.topics
        }))
        .find(e => e.eventName === 'ClaimedRewards');
      claimArgs = claimedEvent?.args as unknown as ClaimedRewardsLog;
    } catch (err) {
      log.error(err);
    }
    const amountHack = claimArgs?.amount0 || 0;
    const amountEth = claimArgs?.amount1 || 0;

    const summary =
      'Claim Rewards Summary:\n' +
      '============================\n' + (amountEth ?
        `Total Weth Claimed: ${amountEth}\n`:'') + (amountHack ?
        `Total Hackathon Claimed: ${amountHack}\n`:'') +
      '============================\n' +
      '\nSuccess: Clanker Rewards successfuly claimed.' +
      `\nTransaction Hash: ${txHash}` +
      `\nTransaction Link: https://${
        process.env.NETWORK_ID === 'base-mainnet' ? '' : 'sepolia.'
      }basescan.org/tx/${txHash}\n`;
    log.info(summary);
    return summary;
  } catch (error) {
    log.error(error);
  }
  return 'Error: Could not claim clanker rewards.';
}

export function getClaimClankerRewardsTool(agentkit: Agent) {
  // Create the CdpTool instance
  return new CdpTool(
    {
      name: 'claim_clanker_rewards',
      description: CLAIM_REWARDS_PROMPT,
      argsSchema: ClaimRewardsInput,
      func: claimClankerRewards
    },
    agentkit
  );
};
