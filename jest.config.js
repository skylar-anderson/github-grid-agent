module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/app/columns/__tests__/setup.ts'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^@/(.*)$': '<rootDir>/$1'
  },
  transform: {
    '^.+\\.(ts|tsx|js|jsx|mjs)$': ['babel-jest', { presets: ['next/babel'] }]
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(react-markdown|remark-gfm|@primer/react|unified|unist|unist-util-position|bail|trough|is-plain-obj|micromark|mdast|vfile|vfile-message|property-information|space-separated-tokens|comma-separated-tokens|hast|hast-util-to-jsx-runtime|hast-util-whitespace|html-void-elements|ccount|escape-string-regexp|markdown-table|zwitch|longest-streak|devlop|estree-util-is-identifier-name|estree-util-attach-comments|estree-util-build-jsx|estree-util-visit|estree-walker|estree-util-value-to-estree|decode-named-character-reference|character-entities|@types/hast|@types/unist|vfile-location|unist-util-stringify-position|unist-util-visit|unist-util-visit-parents|unist-util-is)/)'
  ],
  testMatch: [
    "**/__tests__/**/*.[jt]s?(x)",
    "**/?(*.)+(spec|test).[jt]s?(x)"
  ],
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/.next/',
    '<rootDir>/app/columns/__tests__/setup.ts',
    '<rootDir>/app/columns/__tests__/test-types.ts'
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node', 'mjs'],
  verbose: true
} 