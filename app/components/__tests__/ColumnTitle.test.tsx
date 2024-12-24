import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@primer/react';
import ColumnTitle from '../ColumnTitle';
import { GridContext, GridContextType } from '../GridContext';

// Remove the fetch mock from here
jest.mock('@/app/functions/discussions');
jest.mock('@/app/utils/github', () => ({
  createGitHubClient: jest.fn().mockReturnValue({
    search: {
      issuesAndPullRequests: jest.fn(),
    },
    rest: {
      issues: {
        get: jest.fn(),
      },
      pulls: {
        get: jest.fn(),
      },
      repos: {
        getCommit: jest.fn(),
      },
    },
  }),
}));

describe('ColumnTitle', () => {
  const mockGridState = {
    columns: [
      { title: 'Column 1', instructions: '', type: 'text' as const, cells: [] },
      { title: 'Column 2', instructions: '', type: 'text' as const, cells: [] },
      { title: 'Column 3', instructions: '', type: 'text' as const, cells: [] },
    ],
    primaryColumn: [],
    title: 'Test Grid',
    primaryColumnType: 'issue' as const,
  };

  const mockContextValue: GridContextType = {
    gridState: mockGridState,
    deleteColumnByIndex: jest.fn(),
    moveColumnLeft: jest.fn(),
    moveColumnRight: jest.fn(),
    setGridState: jest.fn(),
    selectRow: jest.fn(),
    updateCellState: jest.fn(),
    addNewColumn: jest.fn(),
    inititializeGrid: jest.fn(),
    selectedIndex: null,
    setGroupBy: jest.fn(),
    setFilterBy: jest.fn(),
    currentGridId: 'test-id',
    setCurrentGridId: jest.fn(),
    getAllGrids: jest.fn(),
    deleteGrid: jest.fn(),
    saveGridAsGist: jest.fn(),
    isSavingGist: false,
    deleteRow: jest.fn(),
  };

  const renderWithContext = (ui: React.ReactElement, contextValue = mockContextValue) => {
    return render(
      <ThemeProvider>
        <GridContext.Provider value={contextValue}>{ui}</GridContext.Provider>
      </ThemeProvider>
    );
  };

  describe('rendering', () => {
    it('renders column title', () => {
      renderWithContext(<ColumnTitle title="Test Column" />);
      expect(screen.getByText('Test Column')).toBeInTheDocument();
    });

    it('does not show move options for primary column', () => {
      renderWithContext(<ColumnTitle title="Primary" />);

      const button = screen.getByLabelText('Column menu');
      fireEvent.click(button);

      expect(screen.queryByText('Move left')).not.toBeInTheDocument();
      expect(screen.queryByText('Move right')).not.toBeInTheDocument();
    });
  });

  describe('Column movement', () => {
    describe('menu options', () => {
      it('shows move options for non-primary columns', () => {
        renderWithContext(<ColumnTitle title="Column" index={1} />);

        const button = screen.getByLabelText('Column menu');
        fireEvent.click(button);

        expect(screen.getByText('Move left')).toBeInTheDocument();
        expect(screen.getByText('Move right')).toBeInTheDocument();
      });

      it('disables move left for first column', () => {
        renderWithContext(<ColumnTitle title="First Column" index={0} />);

        const button = screen.getByLabelText('Column menu');
        fireEvent.click(button);

        const moveLeftItem = screen.getByText('Move left').closest('[aria-disabled="true"]');
        expect(moveLeftItem).toBeInTheDocument();
      });

      it('disables move right for last column', () => {
        renderWithContext(<ColumnTitle title="Last Column" index={2} />);

        const button = screen.getByLabelText('Column menu');
        fireEvent.click(button);

        const moveRightItem = screen.getByText('Move right').closest('[aria-disabled="true"]');
        expect(moveRightItem).toBeInTheDocument();
      });
    });

    describe('interactions', () => {
      beforeEach(() => {
        jest.clearAllMocks();
      });

      it('calls moveColumnLeft when move left is clicked', () => {
        const mockMove = jest.fn();
        const customContext = {
          ...mockContextValue,
          moveColumnLeft: mockMove,
        };

        renderWithContext(<ColumnTitle title="Column" index={1} />, customContext);

        const button = screen.getByLabelText('Column menu');
        fireEvent.click(button);

        fireEvent.click(screen.getByText('Move left'));
        expect(mockMove).toHaveBeenCalledWith(1);
      });

      it('calls moveColumnRight when move right is clicked', () => {
        const mockMove = jest.fn();
        const customContext = {
          ...mockContextValue,
          moveColumnRight: mockMove,
        };

        renderWithContext(<ColumnTitle title="Column" index={1} />, customContext);

        const button = screen.getByLabelText('Column menu');
        fireEvent.click(button);

        fireEvent.click(screen.getByText('Move right'));
        expect(mockMove).toHaveBeenCalledWith(1);
      });

      it('does not call moveColumnLeft when disabled', () => {
        const mockMove = jest.fn();
        const customContext = {
          ...mockContextValue,
          moveColumnLeft: mockMove,
        };

        renderWithContext(<ColumnTitle title="First Column" index={0} />, customContext);

        const button = screen.getByLabelText('Column menu');
        fireEvent.click(button);

        fireEvent.click(screen.getByText('Move left'));
        expect(mockMove).not.toHaveBeenCalled();
      });

      it('does not call moveColumnRight when disabled', () => {
        const mockMove = jest.fn();
        const customContext = {
          ...mockContextValue,
          moveColumnRight: mockMove,
        };

        renderWithContext(<ColumnTitle title="Last Column" index={2} />, customContext);

        const button = screen.getByLabelText('Column menu');
        fireEvent.click(button);

        fireEvent.click(screen.getByText('Move right'));
        expect(mockMove).not.toHaveBeenCalled();
      });
    });
  });
});
