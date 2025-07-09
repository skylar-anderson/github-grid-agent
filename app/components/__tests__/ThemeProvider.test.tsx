import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, useTheme } from '../../utils/theme-context';
import '@testing-library/jest-dom';

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

global.localStorage = localStorageMock;

// Test component that uses the theme context
const TestComponent = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <div>
      <div data-testid="theme-display">Theme: {theme}</div>
      <button onClick={toggleTheme} data-testid="theme-toggle">
        Toggle Theme
      </button>
    </div>
  );
};

describe('ThemeProvider', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
  });

  it('should default to light theme', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId('theme-display')).toHaveTextContent('Theme: light');
  });

  it('should toggle theme from light to dark', () => {
    localStorageMock.getItem.mockReturnValue(null);
    
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId('theme-display')).toHaveTextContent('Theme: light');
    
    fireEvent.click(screen.getByTestId('theme-toggle'));
    
    expect(screen.getByTestId('theme-display')).toHaveTextContent('Theme: dark');
  });

  it('should toggle theme from dark to light', () => {
    localStorageMock.getItem.mockReturnValue('"dark"');
    
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId('theme-display')).toHaveTextContent('Theme: dark');
    
    fireEvent.click(screen.getByTestId('theme-toggle'));
    
    expect(screen.getByTestId('theme-display')).toHaveTextContent('Theme: light');
  });
});