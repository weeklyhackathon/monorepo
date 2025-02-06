import { encoding_for_model } from 'tiktoken';

export function tokenize(text: string): {tokens: Uint32Array, tokensCount: number} {
  const encoder = encoding_for_model('gpt-4o');
  const tokens = encoder.encode(text);
  encoder.free(); // Free up resources
  return {
    tokens,
    tokensCount: tokens.length
  };
}
