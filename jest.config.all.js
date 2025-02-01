import baseConfig from './jest.config.js';

export default {
  ...baseConfig,
  testPathIgnorePatterns: ['dist'],
  testMatch: ['**/*.spec.ts'],
  testTimeout: 0
};
