import '@testing-library/jest-dom';

// Mock CSS.supports for @primer/react
Object.defineProperty(window, 'CSS', {
  value: {
    supports: () => false,
  },
});

// Mock ResizeObserver for @primer/react components
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock react-markdown
jest.mock('react-markdown', () => {
  return function MockMarkdown({ children }: { children: string }) {
    return children;
  };
});

jest.mock('remark-gfm', () => {
  return () => {};
});

// Add any other global mocks or setup here
