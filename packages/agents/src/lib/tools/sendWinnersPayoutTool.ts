import { Amount, Wallet } from "@coinbase/coinbase-sdk";
import { CdpTool } from "@coinbase/cdp-langchain";
import { z } from "zod";
import { getWinners } from "./utils";
import { Agent, Winner } from "../types";
import { hackathonAddress, hackathonSymbol } from "../constants";
import { log } from "@weeklyhackathon/utils";

// Define the prompt for the winners payout tool
const WINNERS_PAYOUT_PROMPT = "Transfer any 'amount' of the 'token' to a list of well known recipients extracted from the 'winners.json' file";

// Define the input schema using Zod
const WinnersPayoutInput = z.object({
  token: z.string().describe("The ticker or symbol of the token to transfer. Must be one of 'wei', 'gwei', 'hackathon', 'usdc' or 'eth'"),
  amount: z.number().describe("The total amount of the token to be distributed among winners")
});

type WinnersPayoutSchema = z.infer<typeof WinnersPayoutInput>;

/**
 * Processes payouts from a JSON file
 *
 * @param wallet - The wallet to send payments from
 * @param args - Object containing the amount and the symbol of the token
 * @returns A formatted string containing the summary of all operations
 */
async function sendWinnersPayout(
  wallet: any,
  args: WinnersPayoutSchema,
): Promise<string> {
  const { token, amount } = args;
  if (!token || !amount) return "Error: Missing Token or Amount required fields";

  // Fetch current round winners
  const winners: Winner[] = getWinners();
  if (!winners || winners.length === 0) return "Error: Missing Winners";

  // Validate each entry has required fields
  for (let winner of winners) {
    if (!winner.address || !winner.shares) {
      return "Error: Each winner must have 'address' and 'shares' fields";
    }
    winner.amount = Math.floor(amount * parseInt(winner.shares) / 100);
  }

  let successCount = 0;
  let failureCount = 0;
  let resultText = "";

  // Process each payout
  for (const { address, amount, shares } of winners) {
    if (!amount) continue;
    try {
      const transfer = await wallet.createTransfer({
        amount: amount as Amount,
        assetId: token === hackathonSymbol.toLowerCase() ? hackathonAddress : token,
        destination: address,
        gasless: token === 'usdc',
      });

      await transfer.wait();

      resultText +=
        `\nSuccess: Sent ${amount} of ${token} to ${address} with ${shares} shares` +
        `\nTransaction Hash: ${transfer.getTransactionHash()}` +
        `\nTransaction Link: ${transfer.getTransactionLink()}\n`;
      successCount++;
    } catch (error) {
      log.error(error);
      resultText +=
        `\nFailure: Could not send ${amount} to ${address}` +
        `\nError\n`;
      failureCount++;
    }
  }

  // Create the final summary string
  const summary =
    "Winners Payout Summary:\n" +
    "============================\n" +
    `Total Transactions Attempted: ${winners.length}\n` +
    `Successful Transactions: ${successCount}\n` +
    `Failed Transactions: ${failureCount}\n` +
    "\nDetailed Results:\n" +
    "================\n" +
    resultText;
  log.info(summary);
  return summary;
}

export function getWinnersPayoutTool(agentkit: Agent) {
  // Create the CdpTool instance
  return new CdpTool(
    {
      name: "send_winners_payout",
      description: WINNERS_PAYOUT_PROMPT,
      argsSchema: WinnersPayoutInput,
      func: sendWinnersPayout
    },
    agentkit
  );
};
