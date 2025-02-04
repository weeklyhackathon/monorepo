import { getHackerSubmissions } from '@weeklyhackathon/agents/tools/utils';
import { env, log } from '@weeklyhackathon/utils';

export async function evaluateSubmissions(): Promise<void> {
  log.info('Feching submissions');

  /// TODO fetch real submissions
  const submissions = await getHackerSubmissions();

  if (!submissions || submissions.length === 0) {
    log.info('No hacker submissions found');
    return;
  }
  
  log.info('Evaluating submissions'); 

  for (const submission of submissions) {
    const response = await fetch(env.DOMAIN+'/api/process-submission', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.APP_API_KEY
      },
      body: JSON.stringify({
        submission
      })
    });
    if (!response.ok) {
      log.error(`${response.status} - ${response.statusText}`);
    } else {
      log.info('Hacker submission processed');  
      const { score } = await response?.json();
      if (!score) {
        log.info('No score found');
        return;
      }
      log.info('Current Hacker score');  
      log.log(score);
      /// TODO: store hacker score in database 
      log.info('Hacker score stored in database'); 
    }
  }

  log.info('All Submissions evaluated');
}
