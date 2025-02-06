import { log } from "@weeklyhackathon/utils";

export const env = {
  DOMAIN: process.env.DOMAIN as string,
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN as string,
  APP_API_KEY: process.env.APP_API_KEY as string,
  GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID as string,
  GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET as string,
};

/**
 * Validates that required environment variables for the agents are set
 *
 * @throws {Error} - If required environment variables are missing
 * @returns {void}
 */
export function validateAgentEnv(): boolean {
  const missingVars: string[] = [];

  // Check required variables
  const requiredVars = ["CDP_API_KEY_NAME", "CDP_API_KEY_PRIVATE_KEY", "WALLET_DATA_STR", "OPENAI_API_KEY"];
  requiredVars.forEach((varName) => {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  });

  // Exit if any required variables are missing
  if (missingVars.length > 0) {
    console.error("Error: Required environment variables are not set");
    missingVars.forEach((varName) => {
      log.error(`${varName}=your_${varName.toLowerCase()}_here`);
    });
    return false;
  }

  // Warn about optional NETWORK_ID
  if (!process.env.NETWORK_ID) {
    log.warn(
      "Warning: NETWORK_ID not set, defaulting to base-sepolia testnet",
    );
  }
  
  return true;
}
