import { log } from "@weeklyhackathon/utils";
/**
 * Validates that required environment variables are set
 *
 * @throws {Error} - If required environment variables are missing
 * @returns {void}
 */
export function validateEnvironment(): boolean {
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
