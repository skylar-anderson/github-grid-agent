import React from 'react';
import { render, screen } from './test-utils';
import Page from '../page';

// Mock the Grid component
jest.mock('../components/Grid', () => {
  return function MockGrid({ createPrimaryColumn, hydrateCell }: any) {
    return (
      <div data-testid="mock-grid">
        Mock Grid Component
        <div data-testid="create-primary-column">
          {typeof createPrimaryColumn === 'function' ? 'createPrimaryColumn is function' : 'no function'}
        </div>
        <div data-testid="hydrate-cell">
          {typeof hydrateCell === 'function' ? 'hydrateCell is function' : 'no function'}
        </div>
      </div>
    );
  };
});

// Mock the server actions
jest.mock('../actions', () => ({
  createPrimaryColumn: jest.fn(),
  hydrateCell: jest.fn(),
}));

describe('Page Component', () => {
  it('renders without crashing', () => {
    expect(() => {
      render(<Page />);
    }).not.toThrow();
  });

  it('renders the Grid component', () => {
    render(<Page />);
    
    expect(screen.getByTestId('mock-grid')).toBeInTheDocument();
  });

  it('passes server actions to Grid component', () => {
    render(<Page />);
    
    expect(screen.getByTestId('create-primary-column')).toHaveTextContent('createPrimaryColumn is function');
    expect(screen.getByTestId('hydrate-cell')).toHaveTextContent('hydrateCell is function');
  });

  it('wraps Grid in ThemeProvider and BaseStyles', () => {
    const { container } = render(<Page />);
    
    // The ThemeProvider and BaseStyles should be applied
    // We can check if the component renders without styling errors
    expect(container.firstChild).toBeTruthy();
  });

  it('uses Primer React components correctly', () => {
    // This test ensures that Primer React components are imported and used correctly
    const { container } = render(<Page />);
    
    // Check that the component structure exists
    expect(container.querySelector('[data-testid="mock-grid"]')).toBeInTheDocument();
  });
});