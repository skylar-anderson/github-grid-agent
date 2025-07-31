import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { ThemeProvider, BaseStyles } from '@primer/react';

// Mock functions for server actions
export const mockCreatePrimaryColumn = jest.fn();
export const mockHydrateCell = jest.fn();

// Custom render function that includes providers
const AllTheProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ThemeProvider>
      <BaseStyles>
        {children}
      </BaseStyles>
    </ThemeProvider>
  );
};

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };

// Mock grid data for testing
export const mockGridData = {
  id: 'test-grid',
  rows: [
    { id: 'row1', cells: { col1: { state: 'done' as const, response: 'Test data 1' } } },
    { id: 'row2', cells: { col1: { state: 'done' as const, response: 'Test data 2' } } },
  ],
  columns: [
    { 
      id: 'col1', 
      name: 'Test Column', 
      type: 'text' as const, 
      multiple: false,
      prompt: 'Test prompt'
    }
  ],
  primaryDataType: 'item' as const,
  name: 'Test Grid'
};

// Mock column type
export const mockColumnType = {
  renderCell: jest.fn(() => <div>Mock Cell</div>),
  generateResponseSchema: jest.fn(() => ({ type: 'string' })),
  parseResponse: jest.fn((response: string) => response),
};

// Setup for component tests
export const setupComponentTest = () => {
  // Reset all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    mockCreatePrimaryColumn.mockResolvedValue(mockGridData);
    mockHydrateCell.mockResolvedValue({ state: 'done', response: 'Test response' });
  });
};

// Test to verify the utilities work correctly
describe('Test utilities', () => {
  it('exports all required utilities', () => {
    expect(mockCreatePrimaryColumn).toBeDefined();
    expect(mockHydrateCell).toBeDefined();
    expect(mockGridData).toBeDefined();
    expect(mockColumnType).toBeDefined();
  });
});