# 🏆 Weekly Hackathon Platform  

A decentralized and autonomous platform for running **weekly hackathons**, where developers compete by submitting **pull requests (PRs)** to GitHub repositories. The system **automatically scores submissions** and **pays the winner**, leveraging AI agents for judging and blockchain for transparent payments.

---

## 🚀 How It Works  

### 1️⃣ **Hackathon Setup**  
- A **weekly hackathon** is scheduled (e.g., every Thursday).  
- Developers **connect their GitHub accounts** to participate.  
- Participants **submit PRs** to the designated repository before the deadline.  

### 2️⃣ **Pull Request Submission & Tracking**  
- The system **whitelists developers** based on predefined rules.  
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
- **Database**: PostgreSQL / Firebase  
- **AI Judging**: LLM-based scoring models  
- **Blockchain**: Crypto payments (Ethereum, Solana, etc.)  

---

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
