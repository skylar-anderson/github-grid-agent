# Testing Documentation

This document describes the testing setup for the GitHub Grid Agent project, including how to run tests, add new tests, and maintain good test coverage.

## Test Setup Overview

The project uses Jest with React Testing Library for comprehensive testing of components and utilities. The testing configuration is designed to catch major potential issues and ensure code reliability.

### Test Framework
- **Jest**: Primary testing framework with extensive mocking capabilities
- **React Testing Library**: Component testing with user-centric test utilities
- **@testing-library/jest-dom**: Custom Jest matchers for DOM testing
- **JSDOM**: Browser environment simulation for component tests

## Running Tests

### Basic Test Commands

```bash
# Run all tests once
npm test

# Run tests in watch mode (reruns on file changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run tests with coverage in watch mode
npm run test:coverage:watch
```

### Coverage Thresholds

The project is configured with coverage thresholds to maintain code quality:
- **Statements**: 70% minimum
- **Branches**: 70% minimum  
- **Functions**: 70% minimum
- **Lines**: 70% minimum

## Current Test Coverage

### Well-Tested Areas ✅
- **Column Types**: Complete test coverage for all column type components
- **Utility Functions**: Full coverage for string utilities, URL params, and localStorage
- **Basic Component Integration**: Page component and test utilities

### Areas Needing More Tests ⚠️
- **Server Actions** (0% coverage): Critical business logic in `actions.ts`
- **Main Components** (0% coverage): Grid, Home, GridContext, and other core UI components
- **Functions** (0% coverage): GitHub API functions and external integrations
- **Complex Components**: GridTable, GridHeader, SelectedRowPanel

## Test Structure

### Test Files Organization
```
app/
├── __tests__/           # Root-level tests (page, integration)
│   ├── test-utils.tsx   # Shared testing utilities
│   └── page.test.tsx    # Main page component tests
├── columns/__tests__/   # Column type tests
├── components/__tests__/ # Component tests  
└── utils/__tests__/     # Utility function tests
```

### Test Utilities

The project includes shared test utilities in `app/__tests__/test-utils.tsx`:

- **Custom render function**: Wraps components with ThemeProvider and BaseStyles
- **Mock functions**: Pre-configured mocks for server actions
- **Test data**: Sample grid data for consistent testing
- **Setup helpers**: Common test setup and teardown functions

### Example Usage

```typescript
import { render, screen } from '../__tests__/test-utils';
import { mockCreatePrimaryColumn } from '../__tests__/test-utils';

test('component renders correctly', () => {
  render(<MyComponent />);
  expect(screen.getByRole('button')).toBeInTheDocument();
});
```

## Adding New Tests

### For Utility Functions

1. Create test file in appropriate `__tests__` directory
2. Import the function and test all edge cases
3. Use descriptive test names and group related tests

```typescript
// app/utils/__tests__/myFunction.test.ts
import { myFunction } from '../myFunction';

describe('myFunction', () => {
  it('handles normal input correctly', () => {
    expect(myFunction('input')).toBe('expected output');
  });

  it('handles edge cases', () => {
    expect(myFunction('')).toBe('');
    expect(myFunction(null)).toBe('default');
  });
});
```

### For React Components

1. Use the shared test utilities for consistent setup
2. Test user interactions and component behavior
3. Mock external dependencies appropriately

```typescript
// app/components/__tests__/MyComponent.test.tsx
import { render, screen, fireEvent } from '../../__tests__/test-utils';
import MyComponent from '../MyComponent';

describe('MyComponent', () => {
  it('renders without crashing', () => {
    render(<MyComponent />);
    expect(screen.getByRole('main')).toBeInTheDocument();
  });

  it('handles user interactions', () => {
    render(<MyComponent />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByText('Expected result')).toBeInTheDocument();
  });
});
```

### For Server Actions

Server actions require careful mocking of external dependencies:

```typescript
// Mock external APIs
jest.mock('openai');
jest.mock('../utils/github');

// Test the action
import { myServerAction } from '../actions';

describe('myServerAction', () => {
  it('processes data correctly', async () => {
    const result = await myServerAction(testData);
    expect(result).toEqual(expectedResult);
  });
});
```

## Best Practices

### Test Naming
- Use descriptive test names that explain the expected behavior
- Group related tests using `describe` blocks
- Follow the pattern: "should [expected behavior] when [condition]"

### Mocking Strategy
- Mock external dependencies at the module level
- Use Jest's auto-mocking for complex external libraries
- Create reusable mock data in test utilities

### Test Data
- Use realistic but minimal test data
- Create factories for generating test data variations
- Store common test data in the test utilities file

### Coverage Guidelines
- Aim for meaningful tests, not just coverage numbers
- Focus on testing user-facing behavior and edge cases
- Test error conditions and boundary cases
- Don't test implementation details

## Common Testing Patterns

### Testing Hooks
```typescript
import { renderHook, act } from '@testing-library/react';
import { useMyHook } from '../useMyHook';

test('hook updates state correctly', () => {
  const { result } = renderHook(() => useMyHook());
  
  act(() => {
    result.current.updateValue('new value');
  });
  
  expect(result.current.value).toBe('new value');
});
```

### Testing Async Operations
```typescript
test('async operation completes successfully', async () => {
  render(<AsyncComponent />);
  
  await waitFor(() => {
    expect(screen.getByText('Loaded data')).toBeInTheDocument();
  });
});
```

### Testing Error States
```typescript
test('displays error message on failure', async () => {
  // Mock API to return error
  mockApi.mockRejectedValueOnce(new Error('API Error'));
  
  render(<ComponentWithAPI />);
  
  await waitFor(() => {
    expect(screen.getByText(/error/i)).toBeInTheDocument();
  });
});
```

## Debugging Tests

### Running Specific Tests
```bash
# Run tests for a specific file
npm test -- MyComponent.test.tsx

# Run tests matching a pattern
npm test -- --testNamePattern="should handle errors"

# Run tests in a specific directory
npm test -- app/utils
```

### Debugging Tips
- Use `screen.debug()` to see current DOM state
- Add `console.log` statements to understand test flow
- Use VS Code's Jest extension for inline test running
- Check Jest configuration in `jest.config.js` for custom settings

## Future Testing Improvements

### Priority Areas for Additional Tests
1. **Server Actions**: Add comprehensive tests for `actions.ts`
2. **Core Components**: Test Grid, Home, and GridContext components
3. **Integration Tests**: Test complete user workflows
4. **Error Handling**: Test error boundaries and failure states
5. **Performance**: Add tests for component performance and memory usage

### Testing Infrastructure Improvements
- Add visual regression testing with tools like Storybook
- Implement E2E testing with Playwright or Cypress
- Add accessibility testing with jest-axe
- Set up mutation testing to verify test quality

## Troubleshooting

### Common Issues
- **Mock not working**: Ensure mocks are defined before imports
- **Async test failing**: Use `waitFor` or `findBy` queries for async content
- **Component not rendering**: Check if required providers are wrapped
- **Coverage too low**: Identify untested branches with coverage report

### Getting Help
- Check Jest documentation: https://jestjs.io/
- React Testing Library guides: https://testing-library.com/docs/react-testing-library/intro/
- Review existing tests in the codebase for patterns
- Use the shared test utilities for consistent testing setup