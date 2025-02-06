export default {
  displayName: 'github',
  preset: '../../jest.config.js',
  testEnvironment: 'node',
  transform: {
    '^.+\.(t|j)sx?$': ['@swc/jest',
    {
      jsc: { baseUrl: '.' }
    }],
  },
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: 'test-output/jest/coverage'
};
