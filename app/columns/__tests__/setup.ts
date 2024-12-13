import '@testing-library/jest-dom';

// Mock CSS.supports for @primer/react
Object.defineProperty(window, 'CSS', {
  value: {
    supports: () => false,
  },
});

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
