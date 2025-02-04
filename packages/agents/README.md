## Agents 

- This package implements autonomous agents powered by the [Coinbase Developer Platform Agentkit](https://github.com/coinbase/agentkit/tree/master).

## How to

- First, initialize the agent selecting the type of the agent: "hacker", "judge" or "payment". Every agent has its own assigned task.
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
CDP_API_KEY_NAME=
CDP_API_KEY_PRIVATE_KEY=
WALLET_DATA_STR=
OPENAI_API_KEY=
```

### Example Usage

- Check the `apps/weeklyhackathon-core/src/api/send-prizes` to see the Payment Agent in action. 
- Check the `apps/weeklyhackathon-core/src/api/process-submission` to see the Hacker and Judge Agents in action. 
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

