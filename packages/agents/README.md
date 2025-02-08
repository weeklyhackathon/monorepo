## Agents 

- This package implements autonomous agents powered by the [Coinbase Developer Platform Agentkit](https://github.com/coinbase/agentkit/tree/master).

## How to

- First, initialize the agent selecting the type of the agent: "hacker", "judge", "payment" or "messenger". Every agent has its own assigned task.
```
const { agent, config } = initializeAgent("hacker");
```

- Then, ask the agent to perform its task and get a response from the agent. 

```
const messages = await getAgentResponse(agent, config, input); 
console.log(messages);
```

Don't forget to add the required env variables in the `.env` file. 
The Agent package needs the following env variables or will refuse to work:
```
CDP_API_KEY_NAME=get_it_on_coinbase_developer_platform
CDP_API_KEY_PRIVATE_KEY=get_it_on_coinbase_developer_platform
WALLET_DATA_STR={"walletId":string,"seed":string,"defaultAddressId":string}
ANTHROPIC_API_KEY=get_it_from_anthropic

NILLION_ORG_KEY=get_it_from_nillion
NILLION_ORG_DID=get_it_from_nillion
```

### Example Usage

- Check the `apps/weeklyhackathon-core/src/api/send-prizes` to see the Payment Agent in action. 
- Check the `apps/weeklyhackathon-core/src/api/process-submission` to see the Hacker, Judge and Messenger Agents in action. 
- It is executed from the `apps/weeklyhackathon-core/src/cron/distributePrizes` function in a weekly cron task. Every Friday 00:00 UTC.
- They are executed from the `apps/weeklyhackathon-core/src/cron/evaluateSubmissions` function in a daily cron task. Every day 00:00 UTC.


## Hacker Agent

- Summarize the pull request submission and presents it as a string to the Judge(s). 
- Started from a daily cron task that processes the submissions of the day.
- Input is the pull request to be summarized by the Hacker agent.

## Judge Agent

- Judge the hackathon submissions. Assigns a score and add a short string as explanation about the choice.
- The Judge communicates with the hackers to receive the submissions before judging them in a multi-agent workflow.
- Prompt must include the hacker submission and the Hacker agent response.
- Then, the score is stored in the database.

## Payment Agent

- Distributes the last week trading fees of the hackathon/eth token pair as prizes to the 8 top scores of the weekly hackathon.
- The Payment Agent must be able to manage a wallet with access to claim the hackathon trading fees and, ofc, to extract the list of winners (top 8 scores), their addresses and shares of the prizes from the database and to split the total amount of eth and hackathon in its wallet between the winners. 
- Prompt must include the token to distribute. Once at time. Eth or Hackathon tokens.
- Inputs: the token to be distributed. 

### Tools

- CDP toolkit.
- Claim Clanker Rewards tool.
- Send winners payout tool.

## Farcaster Based Messenger Agent aka Weekly Hackathon Agent of Messaging (WHAM)

- Send casts (posts) based on the hacker submissions and the judging process to the farcaster social network.
- The messenger receives the outputs of the Hacker and Judge agents, then format it to create banger casts and grow an audience in the farcaster social network. 
- Prompt must include the Hacker and Judge agents responses.

Meet (@wham)[https://warpcast.com/~/wham].

### Tools

- CDP toolkit.
- Send Cast to Farcaster tool

## Weekly Hackathon Multi Agents Workflow

### Human
- Human Hacker log in with github.
- Human Hacker submits a pull request.

### Machine
- Some LLMs analyze the pull request and its repo. Then, generates and stores enriched data.
- The Hacker Agent cron task starts at midnight and review the diff file of the pull request and generates a final submission description.
- The Hacker submits to the Judge(s) all the relevant data: enriched pull request, diff, description and enriched data from the repository too.
- The Judge(s) analyze the code after using the enriched data to get a better context of the pull request.
- The Judge(s) generates a score to be stored in the database and message explaining it.
- Both, the Hacker and Judge responses are sent as input to the Messenger Agent that send 2 casts, 1 about the hacker submission and 1 about the judging process to farcaster.
- The Payment Agent cron task starts at Friday, find the top8 scores, claim the token fees and distribute them among the winners according with the shares of every winner.

- Repeat.
