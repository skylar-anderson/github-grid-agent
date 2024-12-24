import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { GridProvider, useGridContext } from '../GridContext';
import type { GridState } from '../../actions';

// Mock useLocalStorage
jest.mock('../../utils/local-storage', () => ({
  __esModule: true,
  default: () => {
    const [state, setState] = React.useState<Record<string, GridState>>({});
    return [state, setState];
  },
}));

// Remove the fetch mock from here
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
    paginate: jest.fn(),
  }),
}));

// Add mock for octokit
jest.mock('octokit', () => ({
  Octokit: jest.fn().mockImplementation(() => ({
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
    paginate: jest.fn(),
  })),
}));

describe('GridContext - Column Movement', () => {
  const mockHydrateCell = jest.fn().mockResolvedValue({ promise: Promise.resolve({}) });
  const mockCreatePrimaryColumn = jest.fn();

  const initialGridState: GridState = {
    columns: [
      { title: 'Column 1', cells: [], type: 'text', instructions: '' },
      { title: 'Column 2', cells: [], type: 'text', instructions: '' },
      { title: 'Column 3', cells: [], type: 'text', instructions: '' },
    ],
    primaryColumn: [],
    title: 'Test Grid',
    primaryColumnType: 'issue',
  };

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <GridProvider hydrateCell={mockHydrateCell} createPrimaryColumn={mockCreatePrimaryColumn}>
      {children}
    </GridProvider>
  );

  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('moveColumn', () => {
    describe('moving left', () => {
      it('moves a column left', async () => {
        const { result } = renderHook(() => useGridContext(), { wrapper });

        await act(async () => {
          result.current.setCurrentGridId('test-id');
          await new Promise((resolve) => setTimeout(resolve, 0));
        });

        await act(async () => {
          result.current.setGridState(initialGridState);
          await new Promise((resolve) => setTimeout(resolve, 0));
        });

        await act(async () => {
          result.current.moveColumnLeft(1);
          await new Promise((resolve) => setTimeout(resolve, 0));
        });

        expect(result.current.gridState?.columns[0].title).toBe('Column 2');
        expect(result.current.gridState?.columns[1].title).toBe('Column 1');
        expect(result.current.gridState?.columns[2].title).toBe('Column 3');
      });

      it('does not move first column left', async () => {
        const { result } = renderHook(() => useGridContext(), { wrapper });

        await act(async () => {
          result.current.setCurrentGridId('test-id');
          await new Promise((resolve) => setTimeout(resolve, 0));
        });

        await act(async () => {
          result.current.setGridState(initialGridState);
          await new Promise((resolve) => setTimeout(resolve, 0));
        });

        await act(async () => {
          result.current.moveColumnLeft(0);
          await new Promise((resolve) => setTimeout(resolve, 0));
        });

        expect(result.current.gridState?.columns[0].title).toBe('Column 1');
        expect(result.current.gridState?.columns[1].title).toBe('Column 2');
        expect(result.current.gridState?.columns[2].title).toBe('Column 3');
      });
    });

    describe('moving right', () => {
      it('moves a column right', async () => {
        const { result } = renderHook(() => useGridContext(), { wrapper });

        await act(async () => {
          result.current.setCurrentGridId('test-id');
          await new Promise((resolve) => setTimeout(resolve, 0));
        });

        await act(async () => {
          result.current.setGridState(initialGridState);
          await new Promise((resolve) => setTimeout(resolve, 0));
        });

        await act(async () => {
          result.current.moveColumnRight(1);
          await new Promise((resolve) => setTimeout(resolve, 0));
        });

        expect(result.current.gridState?.columns[0].title).toBe('Column 1');
        expect(result.current.gridState?.columns[1].title).toBe('Column 3');
        expect(result.current.gridState?.columns[2].title).toBe('Column 2');
      });

      it('does not move last column right', async () => {
        const { result } = renderHook(() => useGridContext(), { wrapper });

        await act(async () => {
          result.current.setCurrentGridId('test-id');
          await new Promise((resolve) => setTimeout(resolve, 0));
        });

        await act(async () => {
          result.current.setGridState(initialGridState);
          await new Promise((resolve) => setTimeout(resolve, 0));
        });

        await act(async () => {
          result.current.moveColumnRight(2);
          await new Promise((resolve) => setTimeout(resolve, 0));
        });

        expect(result.current.gridState?.columns[0].title).toBe('Column 1');
        expect(result.current.gridState?.columns[1].title).toBe('Column 2');
        expect(result.current.gridState?.columns[2].title).toBe('Column 3');
      });
    });

    describe('edge cases', () => {
      it('handles invalid indices gracefully', async () => {
        const { result } = renderHook(() => useGridContext(), { wrapper });

        await act(async () => {
          result.current.setCurrentGridId('test-id');
          await new Promise((resolve) => setTimeout(resolve, 0));
        });

        await act(async () => {
          result.current.setGridState(initialGridState);
          await new Promise((resolve) => setTimeout(resolve, 0));
        });

        await act(async () => {
          result.current.moveColumnLeft(-1);
          await new Promise((resolve) => setTimeout(resolve, 0));
          result.current.moveColumnRight(5);
          await new Promise((resolve) => setTimeout(resolve, 0));
        });

        expect(result.current.gridState?.columns[0].title).toBe('Column 1');
        expect(result.current.gridState?.columns[1].title).toBe('Column 2');
        expect(result.current.gridState?.columns[2].title).toBe('Column 3');
      });

      it('handles null grid state', async () => {
        const { result } = renderHook(() => useGridContext(), { wrapper });

        await act(async () => {
          result.current.moveColumnLeft(1);
          await new Promise((resolve) => setTimeout(resolve, 0));
          result.current.moveColumnRight(1);
          await new Promise((resolve) => setTimeout(resolve, 0));
        });

        expect(result.current.gridState).toBeNull();
      });
    });
  });
});
