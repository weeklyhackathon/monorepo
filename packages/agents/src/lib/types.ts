export type Winner = {
  wallet_address: string;
  shares: string;
  amount?: Number;
}

export enum AgentType {
  Judge = "judge",
  Hacker = "hacker",
  Payment = "payment"
}
