export const getWinners = () => [
  {
    'address': '0x26281BB0b775A59Db0538b555f161E8F364fd21e',
    'shares': '42'
  },
  {
    'address': '0x26281BB0b775A59Db0538b555f161E8F364fd21e',
    'shares': '21'
  },
  {
    'address': '0x26281BB0b775A59Db0538b555f161E8F364fd21e',
    'shares': '16'
  },
  {
    'address': '0x26281BB0b775A59Db0538b555f161E8F364fd21e',
    'shares': '7'
  },
  {
    'address': '0x26281BB0b775A59Db0538b555f161E8F364fd21e',
    'shares': '5'
  },
  {
    'address': '0x26281BB0b775A59Db0538b555f161E8F364fd21e',
    'shares': '3'
  },
  {
    'address': '0x26281BB0b775A59Db0538b555f161E8F364fd21e',
    'shares': '3'
  },
  {
    'address': '0x26281BB0b775A59Db0538b555f161E8F364fd21e',
    'shares': '3'
  }
];

export const getTokenAmounts = () => ({
  amountEth: 12345, // wei
  amountHack: 12345 // hackathon
});

export const getHackerSubmissions = () => [
  {
    id: '1ahdjtaj',
    flatFilePR: 'export const myRandomNumber = Math.floor(Math.random() * 69420);',
    hackerAgentResponse: ''
  },
  {
    id: '426djktd',
    flatFilePR: 'export const myRandomNumber = Math.floor(Math.random() * 69420);import { myRandomNumber } from \'./random\';function getRandomNumber() { return randomNumber };',
    hackerAgentResponse: ''
  },
  {
    id: '547jfdg',
    flatFilePR: 'console.log(\'hello world\');',
    hackerAgentResponse: ''
  }
];



export const getFakeEnrichedPullRequests = () => [
{
  diff: `diff --git a/apps/weeklyhackathon-core/src/main.ts b/apps/weeklyhackathon-core/src/main.ts
index 3c1d689..c811d55 100644
--- a/apps/weeklyhackathon-core/src/main.ts
+++ b/apps/weeklyhackathon-core/src/main.ts
@@ -1,4 +1,5 @@
 import { setTelegramBotWebhook } from '@weeklyhackathon/telegram';
+//import { createSchema, writeToNodes, readFromNodes } from '@weeklyhackathon/agents/nillionVault';
 import { log, env } from '@weeklyhackathon/utils';
 import { startCronJobs } from './cron';
 import { app } from './server';
@@ -11,10 +12,19 @@ app.listen(port, host, () => {
   log.info([ ready ]");
 });
+
 startCronJobs();
+
 configureBot();
+
+/// must run this once to set up the nillion vault 
+/// create the schema and write the PK secret in the vault
+/// (it was already done, just ignore it)
+//createSchema();
+//writeToNodes();
+
 async function configureBot() {
   const webhookUrl = '/api/chat-telegram';
diff --git a/packages/agents/src/lib/nillionVault.ts b/packages/agents/src/lib/nillionVault.ts
new file mode 100644
index 0000000..f3741c3
--- /dev/null
+++ b/packages/agents/src/lib/nillionVault.ts
@@ -0,0 +1,134 @@
+// @ts-nocheck
+import { log } from "@weeklyhackathon/utils";
+
+const nillionConfig = {
+  orgCredentials: {
+    secretKey: process.env.NILLION_ORG_KEY as string,
+    orgDid: process.env.NILLION_ORG_DID as string
+  },
+  nodes: [
+    {
+      url: 'https://nildb-zy8u.nillion.network',
+      did: 'did:nil:testnet:nillion1fnhettvcrsfu8zkd5zms4d820l0ct226c3zy8u',
+    },
+    {
+      url: 'https://nildb-rl5g.nillion.network',
+      did: 'did:nil:testnet:nillion14x47xx85de0rg9dqunsdxg8jh82nvkax3jrl5g',
+    },
+    {
+      url: 'https://nildb-lpjp.nillion.network',
+      did: 'did:nil:testnet:nillion167pglv9k7m4gj05rwj520a46tulkff332vlpjp',
+    }
+  ]
+};
+
+const agentKeysSchema = {
+  "$schema": "http://json-schema.org/draft-07/schema#",
+  "title": "Weekly Hackathon",
+  "type": "array",
+  "items": {
+    "type": "object",
+    "properties": {
+      "_id": {
+        "type": "string",
+        "format": "uuid",
+        "coerce": true
+      },
+      "name": {
+        "type": "string"
+      },
+      "pk": {
+        "type": "object",
+        "properties": {
+          "$share": {
+            "type": "string"
+          }
+        },
+        "required": ["$share"]
+      }
+    },
+    "required": ["_id", "name", "pk"]
+  }
+}
+// we got this after run createSchema
+const SCHEMA_ID = "b28c547d-6fdb-401d-9a8d-01b1082e40bc";
+
+export async function createSchema(): Promise<void> {
+  log.info('Creating nillion secret vault schema');
+  try {
+    const module: any = await import('nillion-sv-wrappers');
+    const SecretVaultWrapper = module.SecretVaultWrapper;
+
+    const nillionOrg = new SecretVaultWrapper(
+      nillionConfig.nodes,
+      nillionConfig.orgCredentials
+    );
+    await nillionOrg.init();
+
+    const schema = await nillionOrg.createSchema(agentKeysSchema, 'Weekly Hackathon');
+    log.info('New Collection Schema created for all nodes:', schema);
+    log.info('Schema ID:', schema[0].result.data);    
+  } catch (error: any) {
+    log.error('Error creating schema:', error?.message);
+  }
+}
+
+
+export async function writeToNodes(): Promise<void> {
+  log.info('Writing to nillion secret vault nodes');
+  try {
+    const module: any = await import('nillion-sv-wrappers');
+    const SecretVaultWrapper = module.SecretVaultWrapper;
+
+    const collection = new SecretVaultWrapper(
+      nillionConfig.nodes,
+      nillionConfig.orgCredentials,
+      SCHEMA_ID
+    );
+    await collection.init();
+
+    // Write collection data to nodes encrypting the specified fields ahead of time
+    const dataWritten = await collection.writeToNodes([{
+      name: 'Weekly Hackathon 000', // name will be stored as plain text
+      pk: { $allot: process.env.PK as string }, // pk will be encrypted to a $share
+    }]);
+    log.info('Data written to nillion secret vault nodes');
+    log.log(JSON.stringify(dataWritten, null, 2));
+
+    // Get the ids of the SecretVault records created
+    log.info('Uploaded Record IDs to the vault');
+    log.log(dataWritten.map((item: any) => item.result.data.created).flat());
+  } catch (error: any) {
+    log.error('Error storing data in the nillion vault', error?.message);
+  }
+}
+
+
+export async function readFromNodes(): Promise<string> {
+  log.info('Reading from nillion secret vault nodes');
+  try {
+    const module: any = await import('nillion-sv-wrappers');
+    const SecretVaultWrapper = module.SecretVaultWrapper;
+
+    const collection = new SecretVaultWrapper(
+      nillionConfig.nodes,
+      nillionConfig.orgCredentials,
+      SCHEMA_ID
+    );
+    await collection.init();
+
+    // Read all collection data from the nodes, decrypting the specified fields
+    const decryptedCollectionData = await collection.readFromNodes({});
+    const decrypted = await decryptedCollectionData.slice(0, 1);
+    
+    // Log first record (we have just one, should be good to go)
+    log.info('Decrypted data from nillion vault');
+    log.log(decrypted?.[0]);
+    
+    return decrypted?.[0]?.name === "Weekly Hackathon 000" ? 
+      decrypted?.[0]?.pk as string ?? "" : "";
+  } catch (error: any) {
+    log.error('Error reading data from the nillion vault', error?.message);
+  }
+  return "";
+}
diff --git a/packages/agents/src/lib/tools/claimClankerRewardsTool.ts b/packages/agents/src/lib/tools/claimClankerRewardsTool.ts
index 2e562c0..5fb74b4 100644
--- a/packages/agents/src/lib/tools/claimClankerRewardsTool.ts
+++ b/packages/agents/src/lib/tools/claimClankerRewardsTool.ts
@@ -4,6 +4,7 @@ import { privateKeyToAccount } from 'viem/accounts';
 import { CdpTool } from "@coinbase/cdp-langchain";
 import { Agent, ClaimedRewardsLog } from "../types";
 import { hackathonAddress, hackathonSymbol } from "../constants";
+import { readFromNodes } from '@weeklyhackathon/agents/nillionVault';
 import { log } from "@weeklyhackathon/utils";
 import { z } from "zod";
@@ -54,7 +55,7 @@ async function claimClankerRewards(args: ClaimRewardsSchema): Promise<string> {
     transport: process.env.NETWORK_ID === 'base-mainnet' ? http('https://mainnet.base.org') : http('https://sepolia.base.org')
   });
-  const account = privateKeyToAccount(process.env.PK);
+  const account = privateKeyToAccount(await readFromNodes()`,
  repo: {
    productDescription: "A decentralized and autonomous platform for running weekly hackathons, where developers compete by submitting pull requests (PRs) to GitHub repositories. The system automatically scores submissions and pays the winner, leveraging AI agents for judging and blockchain for transparent payments.",
    technicalArchitecture: "empty"
  },
  pullRequest: {
    productAnalysis: "Setup Nillion Secret Vault to store the private key used to call the claim clanker rewards from the agent.",
    technicalArchitecture: "empty"
  }
},

/// other submission
{
diff:`
diff --git a/apps/frontend/index.html b/apps/frontend/index.html
index b604fab..2b5ed7c 100644
--- a/apps/frontend/index.html
+++ b/apps/frontend/index.html
@@ -6,11 +6,11 @@
     <meta name="viewport" content="width=device-width, initial-scale=1.0" />
     <meta
       name="fc:frame"
-      content='{"version":"next","imageUrl":"https://github.com/jpfraneto/images/blob/main/hackathon-banner-.png?raw=true","button":{"title":"$hackathon","action":{"type":"launch_frame","name":"$hackathon","url":"https://weeklyhackathon.com","splashImageUrl":"https://github.com/jpfraneto/images/blob/main/hackathon.png?raw=true","splashBackgroundColor":"#263698"}}}'
+      content='{"version":"next","imageUrl":"https://github.com/jpfraneto/images/blob/main/hackathon-banner-.png?raw=true","button":{"title":"$hackathon","action":{"type":"launch_frame","name":"$hackathon","url":"https://hackathontoken.com","splashImageUrl":"https://github.com/jpfraneto/images/blob/main/hackathon.png?raw=true","splashBackgroundColor":"#263698"}}}'
     />
     <meta property="og:url" content="https://hackathontoken.com" />
     <meta property="og:type" content="website" />
-    <meta property="og:title" content="fedchain" />
+    <meta property="og:title" content="$hackathon" />
     <meta
       property="og:description"
       content="A decentralized and autonomous platform for running weekly hackathons, where developers compete by submitting pull requests (PRs) to GitHub repositories. The system automatically scores submissions and pays the winner, leveraging AI agents for judging and blockchain for transparent payments."
diff --git a/apps/frontend/public/.well-known/farcaster.json b/apps/frontend/public/.well-known/farcaster.json
index fd20369..73d0645 100644
--- a/apps/frontend/public/.well-known/farcaster.json
+++ b/apps/frontend/public/.well-known/farcaster.json
@@ -8,7 +8,7 @@
     "version": "0.0.0",
     "name": "$hackathon",
     "iconUrl": "https://github.com/jpfraneto/images/blob/main/hackathon.png?raw=true",
-    "homeUrl": "https://weeklyhackathon.com",
+    "homeUrl": "https://hackathontoken.com",
     "imageUrl": "https://github.com/jpfraneto/images/blob/main/hackathon-banner-.png?raw=true",
     "buttonTitle": "$hackathon",
     "splashImageUrl": "https://github.com/jpfraneto/images/blob/main/hackathon.png?raw=true",
diff --git a/apps/frontend/src/App.tsx b/apps/frontend/src/App.tsx
index 5e3a0bb..6f6dd50 100644
--- a/apps/frontend/src/App.tsx
+++ b/apps/frontend/src/App.tsx
@@ -192,7 +192,7 @@ function App({
             </a>
           </div>
           <a
-            href="https://warpcast.com/~/frames/launch?domain=weeklyhackathon.com"
+            href="https://warpcast.com/~/frames/launch?domain=hackathontoken.com"
             target="_blank"
             rel="noopener noreferrer"
             className="inline-block px-8 py-3 bg-[#2DFF05]/10 border border-[#2DFF05] rounded-lg hover:bg-[#2DFF05]/20 hover:shadow-[0_0_20px_rgba(45,255,5,0.4)] transition-all duration-300"
@@ -238,7 +238,15 @@ function App({
             Welcome to $HACKATHON
           </p>
           <p className="text-lg text-[#2DFF05]/80">
-            You can now close this tab and go back to the frame
+            You can now close this tab and{" "}
+            <a
+              href="https://warpcast.com/~/frames/launch?domain=weeklyhackathon.com"
+              target="_blank"
+              rel="noopener noreferrer"
+              className="text-purple-500 hover:text-purple-300 transition-colors"
+            >
+              go back to the frame
+            </a>
           </p>
         </div>
       </div>
diff --git a/apps/frontend/src/main.tsx b/apps/frontend/src/main.tsx
index 4ce73eb..1e7a45d 100644
--- a/apps/frontend/src/main.tsx
+++ b/apps/frontend/src/main.tsx
@@ -58,45 +58,52 @@ function Root() {
     undefined
   );
   const [githubUser, setGithubUser] = useState<GithubUser | null>(null);
+  const [error, setError] = useState<string | null>(null);
   useEffect(() => {
     const load = async () => {
-      console.log("Loading SDK context...");
-      const sdkFrameContext = await sdk.context;
-      console.log("SDK Frame Context:", sdkFrameContext);
-
-      if (sdkFrameContext.user.fid) {
-        console.log("User FID found:", sdkFrameContext.user.fid);
-        console.log("Making request to register frame opened...");
-
-        const responseFromServer = await fetch(
-          '/api/auth/register-frame-opened',
-          {
-            method: "POST",
-            headers: {
-              "Content-Type": "application/json",
-              "x-api-key": import.meta.env.VITE_API_KEY,
-            },
-            body: JSON.stringify({
-              frameContext: sdkFrameContext,
-            }),
+      try {
+        console.log("Loading SDK context...");
+        const sdkFrameContext = await sdk.context;
+        console.log("SDK Frame Context:", sdkFrameContext);
+
+        if (sdkFrameContext.user.fid) {
+          console.log("User FID found:", sdkFrameContext.user.fid);
+          console.log("Making request to register frame opened...");
+
+          const responseFromServer = await fetch(
+            '/api/auth/register-frame-opened',
+            {
+              method: "POST",
+              headers: {
+                "Content-Type": "application/json",
+                "x-api-key": import.meta.env.VITE_API_KEY,
+              },
+              body: JSON.stringify({
+                frameContext: sdkFrameContext,
+              }),
+            }
+          );
+
+          const data = await responseFromServer.json();
+          console.log("RESPONSE FROM SERVER: ", data);
+          console.log("Setting frame context and auth token...");
+          setFrameContext(sdkFrameContext as FrameContext);
+          setAuthToken(data.authToken);
+          if (data.githubUser) {
+            console.log("Setting github user...", data.githubUser);
+            setGithubUser(data.githubUser);
           }
-        );
-
-        const data = await responseFromServer.json();
-        console.log("RESPONSE FROM SERVER: ", data);
-        console.log("Setting frame context and auth token...");
-        setFrameContext(sdkFrameContext as FrameContext);
-        setAuthToken(data.authToken);
-        if (data.githubUser) {
-          console.log("Setting github user...", data.githubUser);
-          setGithubUser(data.githubUser);
+        } else {
+          console.log("No user FID found in SDK context");
         }
-      } else {
-        console.log("No user FID found in SDK context");
+      } catch (err) {
+        console.error("Error in load function:", err);
+        setError("An error occurred while loading the application");
+      } finally {
+        console.log("Calling sdk.actions.ready()");
+        sdk.actions.ready();
       }
-      console.log("Calling sdk.actions.ready()");
-      sdk.actions.ready();
     };
     if (sdk && !isSDKLoaded) {
@@ -106,6 +113,31 @@ function Root() {
     }
   }, [isSDKLoaded]);
+  if (error) {
+    return (
+      <div className="min-h-screen bg-black flex items-center justify-center p-4">
+        <div className="text-[#2DFF05] text-center max-w-2xl p-8 border border-[#2DFF05] rounded-lg bg-black shadow-[0_0_30px_rgba(45,255,5,0.3)]">
+          <h1 className="text-4xl font-bold mb-6 animate-pulse">
+            Error Occurred
+          </h1>
+          <p className="text-xl mb-6">{error}</p>
+          <p className="text-lg mb-4">
+            Please contact{" "}
+            <a
+              href="https://warpcast.com/jpfraneto.eth"
+              target="_blank"
+              rel="noopener noreferrer"
+              className="underline hover:text-[#2DFF05]/80 transition-colors"
+            >
+              @jpfraneto.eth
+            </a>{" "}
+            to resolve this issue.
+          </p>
+        </div>
+      </div>
+    );
+  }
+
   return (
     <React.StrictMode>
       <Providers>
diff --git a/apps/frontend/vite.config.ts b/apps/frontend/vite.config.ts
index ffde55d..a7bf911 100644
--- a/apps/frontend/vite.config.ts
+++ b/apps/frontend/vite.config.ts
@@ -6,7 +6,11 @@ import tailwindcss from "@tailwindcss/vite";
 export default defineConfig({
   plugins: [react(), tailwindcss()],
   server: {
-    allowedHosts: ["testing.weeklyhackathon.com"],
+    allowedHosts: [
+      "testing.weeklyhackathon.com",
+      "hackathontoken.com",
+      "weeklyhackathon.com",
+    ],
     port: process.env.PORT ? parseInt(process.env.PORT) : 5173,
     host: true,
   },
diff --git a/apps/weeklyhackathon-core/src/server.ts b/apps/weeklyhackathon-core/src/server.ts
index 88a6238..bf4f609 100644
--- a/apps/weeklyhackathon-core/src/server.ts
+++ b/apps/weeklyhackathon-core/src/server.ts
@@ -24,8 +24,14 @@ app.use(async (ctx, next) => {
   }
 });
-// CORS Middleware
-app.use(cors());
+app.use(
+  cors({
+    origin: process.env.ALLOWED_ORIGIN ?? "*",
+    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
+    allowHeaders: ["Content-Type", "Authorization", "Accept", "x-api-key"],
+    credentials: true,
+  })
+);
 // JSON Parser Middleware
 app.use(koaBody());
`,
  repo: {
    productDescription: "A decentralized and autonomous platform for running weekly hackathons, where developers compete by submitting pull requests (PRs) to GitHub repositories. The system automatically scores submissions and pays the winner, leveraging AI agents for judging and blockchain for transparent payments.",
    technicalArchitecture: "empty"
  },
  pullRequest: {
    productAnalysis: "Add ALLOWED_ORIGIN env variable for cors",
    technicalArchitecture: "empty"
  }
},
/// another one
{
diff:
`
diff --git a/packages/github/src/lib/analyseRepo.ts b/packages/github/src/lib/analyseRepo.ts
index bf9e708..c5e00ea 100644
--- a/packages/github/src/lib/analyseRepo.ts
+++ b/packages/github/src/lib/analyseRepo.ts
@@ -1,9 +1,11 @@
+import fs from 'node:fs/promises';
 import FormData from 'form-data';
 import fetch from 'node-fetch';
 import { log } from '@weeklyhackathon/utils';
 import { askDeepseek } from '@weeklyhackathon/utils/askDeepseek';
 import { tokenize } from '@weeklyhackathon/utils/tokenize';
+
 // Maximum tokens for our LLM context (reserve a margin for the prompt)
 const MAX_TOKENS = 58000;
@@ -181,10 +183,7 @@ async function buildRepoContext(
  * - topics: a list of product-related categories
  * - productDescription: a 200-400 word explanation of the product
  */
-async function analyzeProduct(context: string): Promise<{
-  topics: string[];
-  productDescription: string;
-}> {
+async function analyzeProduct(context: string): Promise<string> {
   const prompt = "
 Please analyze the following GitHub repository code and provide a product analysis.
 Focus on describing what the repository does as a product, its key functionalities, and the user benefits.
@@ -208,9 +207,7 @@ {{context}}
  * - technicalArchitecture: a 200-400 word description of the technical design, frameworks,
  *   key components, design patterns, and other relevant details.
  */
-async function analyzeTechnical(context: string): Promise<{
-  technicalArchitecture: string;
-}> {
+async function analyzeTechnical(context: string): Promise<string> {
   const prompt = "
 Please analyze the following GitHub repository code and provide a technical architecture analysis.
 Focus on describing the technical design, main components, frameworks, design patterns, dependencies, and interactions.
@@ -240,8 +237,8 @@ export async function processRepo({
   repoOwner: string;
   repoName: string;
 }): Promise<{
-  productAnalysis: { topics: string[]; productDescription: string };
-  technicalAnalysis: { technicalArchitecture: string };
+  productAnalysis: string;
+  technicalAnalysis: string;
 }> {
   log.info('--------------------------------');
   log.info("Processing repo: https://github.com/{repoOwner}/repoName");
@@ -265,6 +262,7 @@ export async function processRepo({
     '.vscode',
     'docs',
     'examples',
+    'package-lock.json',
     'docker',
     /\.d\.ts$/  // ignore type definition files
   ];
@@ -275,19 +273,52 @@ export async function processRepo({
   // // Get the two analyses in parallel.
-  const [productAnalysis, technicalAnalysis] = await Promise.all([
-    analyzeProduct(context),
-    analyzeTechnical(context)
-  ]);
+  log.info('Analyzing product...');
+  const productAnalysis = await analyzeProduct(context);
+
+  log.info('Analyzing technical architecture...');
+  const technicalAnalysis = await analyzeTechnical(context);
   const enrichedData = {
     productAnalysis,
     technicalAnalysis,
+    summary: '',
     repoUrl: "https://github.com/{repoOwner}/{repoName}"
   };
+  const summary = await askDeepseek({
+    message: "Please summarize the following repository analysis: {JSON.stringify(enrichedData)}",
+    systemPrompt: 'You are a helpful assistant that can summarize repository analyses.'
+  });
+
+  enrichedData.summary = summary;
   // log.info('--------------------------------');
   return enrichedData;
 }
+
+
+// processRepo({
+//   repoOwner: 'weeklyhackathon',
+//   repoName: 'monorepo'
+// }).then(async(data) => {
+
+//   console.log('Finished processing repo');
+
+//   const formattedAnalysis = await askDeepseek({
+//     message: "Format the following product analysis into a markdown file:\r\n{data.productAnalysis}",
+//     systemPrompt: 'You are a helpful assistant that can format product analysis.'
+//   });
+
+//   await fs.writeFile('analysis.md', formattedAnalysis);
+//   // await saveRepo({
+//   //   analysis: {
+//   //     productDescription: data.productAnalysis,
+//   //     technicalArchitecture: data.technicalAnalysis,
+//   //     summary: 'This is a summary'
+//   //   },
+//   //   owner: 'weeklyhackathon',
+//   //   name: 'monorepo'
+//   // });
+// });
`,
  repo: {
    productDescription: "A decentralized and autonomous platform for running weekly hackathons, where developers compete by submitting pull requests (PRs) to GitHub repositories. The system automatically scores submissions and pays the winner, leveraging AI agents for judging and blockchain for transparent payments.",
    technicalArchitecture: "empty"
  },
  pullRequest: {
    productAnalysis: "Add ALLOWED_ORIGIN env variable for cors",
    technicalArchitecture: "empty"
  }
}
];
