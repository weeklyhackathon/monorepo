// @ts-nocheck
import { log } from '@weeklyhackathon/utils';

const nillionConfig = {
  orgCredentials: {
    secretKey: process.env.NILLION_ORG_KEY as string,
    orgDid: process.env.NILLION_ORG_DID as string
  },
  nodes: [
    {
      url: 'https://nildb-zy8u.nillion.network',
      did: 'did:nil:testnet:nillion1fnhettvcrsfu8zkd5zms4d820l0ct226c3zy8u'
    },
    {
      url: 'https://nildb-rl5g.nillion.network',
      did: 'did:nil:testnet:nillion14x47xx85de0rg9dqunsdxg8jh82nvkax3jrl5g'
    },
    {
      url: 'https://nildb-lpjp.nillion.network',
      did: 'did:nil:testnet:nillion167pglv9k7m4gj05rwj520a46tulkff332vlpjp'
    }
  ]
};

const agentKeysSchema = {
  '$schema': 'http://json-schema.org/draft-07/schema#',
  'title': 'Weekly Hackathon',
  'type': 'array',
  'items': {
    'type': 'object',
    'properties': {
      '_id': {
        'type': 'string',
        'format': 'uuid',
        'coerce': true
      },
      'name': {
        'type': 'string'
      },
      'pk': {
        'type': 'object',
        'properties': {
          '$share': {
            'type': 'string'
          }
        },
        'required': ['$share']
      }
    },
    'required': ['_id', 'name', 'pk']
  }
};
// we got this after run createSchema
const SCHEMA_ID = 'b28c547d-6fdb-401d-9a8d-01b1082e40bc';

export async function createSchema(): Promise<void> {
  log.info('Creating nillion secret vault schema');
  try {
    const module: any = await import('nillion-sv-wrappers');
    const SecretVaultWrapper = module.SecretVaultWrapper;

    const nillionOrg = new SecretVaultWrapper(
      nillionConfig.nodes,
      nillionConfig.orgCredentials
    );
    await nillionOrg.init();

    const schema = await nillionOrg.createSchema(agentKeysSchema, 'Weekly Hackathon');
    log.info('New Collection Schema created for all nodes:', schema);
    log.info('Schema ID:', schema[0].result.data);
  } catch (error: any) {
    log.error('Error creating schema:', error?.message);
  }
}


export async function writeToNodes(): Promise<void> {
  log.info('Writing to nillion secret vault nodes');
  try {
    const module: any = await import('nillion-sv-wrappers');
    const SecretVaultWrapper = module.SecretVaultWrapper;

    const collection = new SecretVaultWrapper(
      nillionConfig.nodes,
      nillionConfig.orgCredentials,
      SCHEMA_ID
    );
    await collection.init();

    // Write collection data to nodes encrypting the specified fields ahead of time
    const dataWritten = await collection.writeToNodes([{
      name: 'Weekly Hackathon 000', // name will be stored as plain text
      pk: {
        $allot: process.env.PK as string
      } // pk will be encrypted to a $share
    }]);
    log.info('Data written to nillion secret vault nodes');
    log.log(JSON.stringify(dataWritten, null, 2));

    // Get the ids of the SecretVault records created
    log.info('Uploaded Record IDs to the vault');
    log.log(dataWritten.map((item: any) => item.result.data.created).flat());
  } catch (error: any) {
    log.error('Error storing data in the nillion vault', error?.message);
  }
}


export async function readFromNodes(): Promise<string> {
  log.info('Reading from nillion secret vault nodes');
  try {
    const module: any = await import('nillion-sv-wrappers');
    const SecretVaultWrapper = module.SecretVaultWrapper;

    const collection = new SecretVaultWrapper(
      nillionConfig.nodes,
      nillionConfig.orgCredentials,
      SCHEMA_ID
    );
    await collection.init();

    // Read all collection data from the nodes, decrypting the specified fields
    const decryptedCollectionData = await collection.readFromNodes({});
    const decrypted = await decryptedCollectionData.slice(0, 1);

    // Log first record (we have just one, should be good to go)
    log.info('Decrypted data from nillion vault');
    log.log(decrypted?.[0]);

    return decrypted?.[0]?.name === 'Weekly Hackathon 000' ?
      decrypted?.[0]?.pk as string ?? '' : '';
  } catch (error: any) {
    log.error('Error reading data from the nillion vault', error?.message);
  }
  return '';
}
