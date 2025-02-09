# 🏆 Weekly Hackathon Platform  

A decentralized and autonomous platform for running **weekly hackathons**, where developers compete by submitting **pull requests (PRs)** to GitHub repositories. The system **automatically scores submissions** and **pays the winner**, leveraging AI agents for judging and blockchain for transparent payments.

---

## 🚀 How It Works  

### 1️⃣ **Hackathon Setup**  
- A **weekly hackathon** is scheduled (e.g., every Thursday).  
- Developers **connect their GitHub accounts** to participate.  
- Participants **submit PRs** to the designated repository before the deadline.  

### 2️⃣ **Pull Request Submission & Tracking**  
- The system **allowlists developers** based on predefined rules.  
- Developers submit **pull requests (PRs)** to the GitHub repo.  
- PRs are stored in the **database**, tagged for evaluation.  

### 3️⃣ **Automated Scoring & Judging**  
- A **Hacker Agent** fetches PRs from the database.  
- The **Judge Agent** evaluates PRs based on:  
  - Code quality  
  - Contribution impact  
  - Repository guidelines  
  - Other predefined metrics  
- The scores are **recorded in the database**.  

### 4️⃣ **Winner Selection & Payment**  
- The **top-scoring PR** is selected.  
- The **Payment Agent** prepares and executes the winner’s reward transaction.  
- Payment is sent via **blockchain or other payment methods**.  

---

## 📜 Architecture  

The platform is structured as a **multi-agent system**:  

- **GitHub Integration**: Fetches PRs, validates users.  
- **Database**: Stores PRs, scores, and user info.  
- **Hacker Agent**: Manages PR submissions.  
- **Judge Agent**: Scores and ranks PRs.  
- **Payment Agent**: Handles winner payout.  
- **Messenger Agent**: Handles farcaster social network account.

---

## 🎯 Features  

✅ **Automated PR scoring**  
✅ **Decentralized payments**  
✅ **Seamless GitHub integration**  
✅ **Transparent and fair judging**  
✅ **Developer incentives for open-source contributions**  

---

## 🛠️ Tech Stack  

- **Backend**: Node.js, TypeScript  
- **Database**: PostgreSQL  
- **Multi Agents System**: Analyzer, Hacker, Judge and Payment. 
- **AI Judging**: LLM-based scoring models  
- **Blockchain**: L2 Based Crypto payments in Ethereum 
- **LLMs**: Anthropic, OpenAI, DeepSeek, Venice
- **Social**: Farcaster

---

## Sponsor Prizes CheatSheet

- **Base**: Yes, Weekly Hackathon aims to be based, certainly it also could be called Farcaster Based Hackathon. Check [$hackathon contract](https://basescan.org/token/0x3dF58A5737130FdC180D360dDd3EFBa34e5801cb#code#F1#L1).
- **Coinbase Agentkit**: All our agents got a wallet. Check our implementation with the CDP Agentkit on the [agents package.](https://github.com/weeklyhackathon/monorepo/tree/main/packages/agents)
- **Nethermind**: It is not the chaos chain but it could be enough wild to arrive consensus there. Multiagent, reinforcement learning for humans with LLM scoring and judging, hacker, social and onchain agents, fully automated protocol, prompt chaining, workflows.. all this repo is an agentic experiment.
- **Nillion**: Secrets stored, distributed and locked. Check our implementation of nillion secret vault to store private keys on this [PR.](https://github.com/weeklyhackathon/monorepo/pull/5)


## 📌 Getting Started  

1️⃣ **Clone the repo**  
```bash
git clone https://github.com/weeklyhackathon/monorepo.git
cd monorepo


2️⃣ **Install dependencies**  
```bash
npm ci
```

3️⃣ **Run the agent**  
```bash
npm run start
```
