export const getWinners = () => [
  {
    "address": "0x26281BB0b775A59Db0538b555f161E8F364fd21e",
    "shares": "42"
  },
  {
    "address": "0x26281BB0b775A59Db0538b555f161E8F364fd21e",
    "shares": "21"
  },
  {
    "address": "0x26281BB0b775A59Db0538b555f161E8F364fd21e",
    "shares": "16"
  },
  {
    "address": "0x26281BB0b775A59Db0538b555f161E8F364fd21e",
    "shares": "7"
  },
  {
    "address": "0x26281BB0b775A59Db0538b555f161E8F364fd21e",
    "shares": "5"
  },
  {
    "address": "0x26281BB0b775A59Db0538b555f161E8F364fd21e",
    "shares": "3"
  },
  {
    "address": "0x26281BB0b775A59Db0538b555f161E8F364fd21e",
    "shares": "3"
  },
  {
    "address": "0x26281BB0b775A59Db0538b555f161E8F364fd21e",
    "shares": "3"
  }
];

export const getTokenAmounts = () => ({
  amountEth: 12345, // wei
  amountHack: 12345 // hackathon 
});

export const getHackerSubmissions = () => [
  { 
    flatFilePR: "export const myRandomNumber = Math.floor(Math.random() * 69420);",
    hackerAgentResponse: ""
  },
  { 
    flatFilePR: "export const myRandomNumber = Math.floor(Math.random() * 69420);import { myRandomNumber } from './random';function getRandomNumber() { return randomNumber };",
    hackerAgentResponse: ""
  },
  { 
    flatFilePR: "console.log('hello world');",
    hackerAgentResponse: ""
  }
];
