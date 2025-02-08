import type { Agent } from '../types';
import { CdpTool } from '@coinbase/cdp-langchain';
import { z } from 'zod';
import { log } from '@weeklyhackathon/utils';

const SEND_CAST_PROMPT = 'Send or publish a cast (post) in the farcaster social network. Include cast content (text) in the \'content\' field';

const SendCastInput = z
  .object({
    content: z.string().describe('The content of the cast to publish in farcaster.')
  })
  .strip()
  .describe('Instructions for publishing a farcaster cast. Use it when required.');


type SendCastSchema = z.infer<typeof SendCastInput>;

/**
 * Sends a cast message to the farcaster network
 *
 * @param args - The input arguments for the action
 * @returns The result of the action
 */
async function sendCast(args: SendCastSchema): Promise<string> {
  log.info('Sending cast...');

  const options: any = {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'x-neynar-experimental': 'false',
      'x-api-key': process.env.NEYNAR_API_KEY || 'NEYNAR_API_DOCS',
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      signer_uuid: process.env.NEYNAR_MANAGER_SIGNER as string,
      text: args.content,
      //embeds: [{url: frame}],
      channel_id: 'weeklyhackathon'
    })
  };
  const endpoint = 'https://api.neynar.com/v2/farcaster/cast';

  try {
    const response = await fetch(endpoint, options);

    if (!response.ok) {
      log.log(`Error: ${response.status} - ${response.statusText}`);
    }

    const success = await response?.json();

    log.info(`Cast sent: ${success?.success}`);

    return args?.content ?? 'false';
  } catch (err) {
    log.error(err);
  }

  return '';
}


export function getSendCastTool(agentkit: Agent) {
  // Create the CdpTool instance
  return new CdpTool(
    {
      name: 'send_cast',
      description: SEND_CAST_PROMPT,
      argsSchema: SendCastInput,
      func: sendCast
    },
    agentkit
  );
};
