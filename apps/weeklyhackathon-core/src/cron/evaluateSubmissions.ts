import { env, log } from '@weeklyhackathon/utils';
import { getEnrichedPullRequests } from '@weeklyhackathon/github';
import { prisma } from '@weeklyhackathon/db';

export async function evaluateSubmissions(): Promise<void> {
  log.info('Feching submissions');

  const submissions = await getEnrichedPullRequests();

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

      try {  
        await prisma.githubPullRequest.update({
          where: {
            id: submission.pullRequest.id
          },
          data: {
            score: score
          }
        });
        
        log.info('Hacker score stored in database'); 
      } catch (error) {
        log.info('Error updating score in the database');
        log.error(error);
      }
    }
  }

  log.info('All Submissions evaluated');
}
