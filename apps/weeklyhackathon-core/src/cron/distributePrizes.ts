import { getWinners } from '@/packages/agents/tools/utils';
import { log } from '@weeklyhackathon/utils';

export async function distributePrizes(): void {
  log.info('Fetching winners');

  /// fetch winners from database (submissions where timestamp last 7 days and top 8 scores desc)
  const winners = await getWinners();
  
  if (!winners || winners.length === 0) {
    log.info('No winners found');
    return;
  }
  
  log.info('Claiming hackathon token trading fees');
  
  /// TODO: call the clanker contract to claim the fees and/or get amounts

  log.info('Distributing prizes');
  
  const response = await fetch('/api/send-prizes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amountEth,
      amountHack,
      winners
    }),
  });
  
  if (!response.ok) {
    log.error(`${response.status} - ${response.statusText}`);
  } else {
    log.info('All prizes has been distributed');  
  }
}
