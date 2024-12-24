module.exports = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    '/node_modules/(?!(octokit|@octokit|@octokit/app|openai|ai|universal-user-agent|graphql-request)/)',
  ],
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(ts|tsx|js|jsx|mjs)$': ['@swc/jest'],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^react-markdown$': '<rootDir>/app/__mocks__/react-markdown.tsx',
    '^remark-gfm$': '<rootDir>/app/__mocks__/remark-gfm.js',
    '^openai$': '<rootDir>/app/__mocks__/openai.ts',
  },
  testPathIgnorePatterns: ['/node_modules/', '/.next/', '/app/columns/__tests__/setup.ts'],
};
