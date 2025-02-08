import cron from 'node-cron';
import { log } from '@weeklyhackathon/utils';
import { distributePrizes } from './distributePrizes';
import { evaluateSubmissions } from './evaluateSubmissions';
import { refreshMissingRepoAnalyses } from './refreshMissingRepoAnalyses';


export function startCronJobs() {
  log.info('Starting cron jobs');
  // Evaluate submissions every day at 00:00 UTC
  cron.schedule('0 0 * * *', evaluateSubmissions);
  // Distribute Prizes every Friday at 00:00 UTC
  cron.schedule('0 0 * * 5', distributePrizes);
  // Analyse repos every hour
  cron.schedule('0 * * * *', refreshMissingRepoAnalyses);
}
/*
export async function startDemo() {
  await evaluateSubmissions();
  await distributePrizes();
}
*/
