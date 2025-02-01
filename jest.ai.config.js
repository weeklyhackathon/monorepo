import baseConfig from './jest.config.js';

export default {
  ...baseConfig,
  testMatch: ['**/*.ai.spec.ts'],
  testPathIgnorePatterns: ['dist']
};
