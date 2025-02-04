import { getHackerSubmissions } from '@weeklyhackathon/agents/tools/utils';
import { log } from '@weeklyhackathon/utils';

export async function evaluateSubmissions(): Promise<void> {
  log.info('Feching submissions');

  /// TODO fetch real submissions
  const submissions = await getHackerSubmissions();

  if (!submissions || submissions.length === 0) {
    log.info('No hacker submissions found');
    return;
  }
  
  log.info('Evaluating submissions'); 

  for (const submission in submissions) {
    const response = await fetch('/api/process-submission', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        submission
      })
    });
    if (!response.ok) {
      log.error(`${response.status} - ${response.statusText}`);
    } else {
      log.info('Hacker submission processed');  
      /// TODO update database with the score of the submission
    }
  }

  log.info('All Submissions evaluated');
}
