import { english, generateMnemonic, mnemonicToAccount } from 'viem/accounts';

// generate 12-word BIP-39 mnemonic (128 bits of entropy)
const mnemonic = generateMnemonic(english, 128);
console.log("Mnemonic:", mnemonic);

// derive path
// "m/44'/60'/${accountIndex}'/${changeIndex}/${addressIndex}"
// default account,change,address index: 0

// get wallet address from mnemonic account
const account = mnemonicToAccount(mnemonic);
console.log("Address:", account.address);
