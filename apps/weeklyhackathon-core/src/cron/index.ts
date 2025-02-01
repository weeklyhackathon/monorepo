import cron from 'node-cron';
import { log } from '@weeklyhackathon/utils';
import { evaluateSubmissions } from './evaluateSubmissions';


export function startCronJobs() {

  log.info('Starting cron jobs');

  // Evaluate submissions every Friday at 00:00 UTC
  cron.schedule('0 0 * * 5', evaluateSubmissions);

}
