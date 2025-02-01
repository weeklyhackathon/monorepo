export default {
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'js', 'json'],
  coverageDirectory: './coverage',
  transform: {
    '^.+\\.(t|j)sx?$': ['@swc/jest',
      {
        jsc: {
          baseUrl: '.'
        }
      }]
  },
  testPathIgnorePatterns: ['__e2e__', 'dist', 'ai.spec.ts', '.e2e.spec.ts', 'integration.spec.ts'],
  collectCoverageFrom: [
    '!**/*.spec.ts'
  ],
  testMatch: ['**/*.spec.ts']
};
