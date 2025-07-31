// Add OpenAI Node.js shims for test environment
import 'openai/shims/node';

// Mock fetch for OpenAI and other API calls
global.fetch = jest.fn();

// Mock process.env for tests
process.env.GITHUB_PAT = 'test-token';
process.env.OPENAI_API_KEY = 'test-key';

// Global test setup
beforeEach(() => {
  jest.clearAllMocks();
});