import { getWinners, getTokenAmounts } from '@weeklyhackathon/agents/tools/utils';
import { env, log } from '@weeklyhackathon/utils';

export async function distributePrizes(): Promise<void> {
  log.info('Distributing prizes');
  
  const response = await fetch(env.DOMAIN+'/api/send-prizes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': env.APP_API_KEY
    }
  });
  
  if (!response.ok) {
    log.error(`${response.status} - ${response.statusText}`);
  } else {
    log.info('All prizes has been distributed');  
  }
}
