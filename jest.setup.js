import 'openai/shims/node';
import '@testing-library/jest-dom';
import { jest } from '@jest/globals';

global.CSS = {
  supports: () => false,
  escape: (str) => str,
};

global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  })
);

process.env.OPENAI_API_KEY = 'test-api-key';

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor(callback) {
    this.callback = callback;
  }
  observe() {}
  unobserve() {}
  disconnect() {}
};
