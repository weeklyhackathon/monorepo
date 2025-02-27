import cron from 'node-cron';
import { log } from '@weeklyhackathon/utils';
import { distributePrizes } from './distributePrizes';
import { evaluateSubmissions } from './evaluateSubmissions';
import { refreshMissingPRAnalyses } from './refreshMissingPRAnalyses';


export function startCronJobs() {
  log.info('Starting cron jobs');
  // Evaluate submissions every day at 00:00 UTC
  //cron.schedule('0 0 * * *', evaluateSubmissions);
  // Distribute Prizes every Friday at 00:00 UTC
  //cron.schedule('0 0 * * 5', distributePrizes);
  // Analyse PRs every hour
  //cron.schedule('0 * * * *', refreshMissingPRAnalyses);
  
  // testing in production, base-mainnet distributePrizes
  //cron.schedule('0 * * * *', distributePrizes);
}

export async function startDemo() {
  //await evaluateSubmissions();
  //await distributePrizes();
}

