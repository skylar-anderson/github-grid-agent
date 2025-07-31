import React, { createContext, useContext, ReactNode, useState, useCallback, useMemo } from 'react';
import { SuccessfulPrimaryColumnResponse, ErrorResponse, GridState, GridCell } from '../actions';
import type { ColumnResponse, ColumnType, GridCol, Option } from '../actions';
import useLocalStorage from '../utils/local-storage';
import { v4 as uuidv4 } from 'uuid';
import { createGist } from '../actions';

export type Grid = {
  id: string;
  title: string;
  rowCount: number;
  columnCount: number;
  createdAt: Date;
};

type GridStateContextType = {
  gridState: GridState | null;
  selectedIndex: number | null;
  currentGridId: string | null;
  isSavingGist: boolean;
};

type GridActionsContextType = {
  setGridState: React.Dispatch<React.SetStateAction<GridState | null>>;
  selectRow: (index: number | null) => void;
  updateCellState: (columnTitle: string, cellIndex: number, newCellContents: GridCell) => void;
  addNewColumn: (props: NewColumnProps) => void;
  inititializeGrid: (s: string) => Promise<string>;
  deleteColumnByIndex: (index: number) => void;
  setGroupBy: (columnTitle: string | undefined) => void;
  setFilterBy: (columnTitle: string | undefined, filterValue: string | undefined) => void;
  setCurrentGridId: (id: string) => void;
  getAllGrids: () => Grid[];
  deleteGrid: (id: string) => void;
  saveGridAsGist: () => Promise<string | null>;
  deleteRow: (index: number) => void;
};

type NewColumnProps = {
  title: string;
  instructions: string;
  type: ColumnType;
  options: Option[];
  multiple?: boolean;
};

const GridStateContext = createContext<GridStateContextType | undefined>(undefined);
const GridActionsContext = createContext<GridActionsContextType | undefined>(undefined);

export const useGridState = () => {
  const context = useContext(GridStateContext);
  if (context === undefined) {
    throw new Error('useGridState must be used within a GridProvider');
  }
  return context;
};

export const useGridActions = () => {
  const context = useContext(GridActionsContext);
  if (context === undefined) {
    throw new Error('useGridActions must be used within a GridProvider');
  }
  return context;
};

// Legacy hook for backward compatibility
export const useGridContext = () => {
  const state = useGridState();
  const actions = useGridActions();
  return { ...state, ...actions };
};

type ProviderProps = {
  hydrateCell: (cell: GridCell) => Promise<{ promise: Promise<GridCell> }>;
  createPrimaryColumn: (s: string) => Promise<SuccessfulPrimaryColumnResponse | ErrorResponse>;
  children: ReactNode;
};

export const GridProvider = React.memo(function GridProvider({ createPrimaryColumn, hydrateCell, children }: ProviderProps) {
  const [grids, setGrids] = useLocalStorage<Record<string, GridState>>('grids', {});
  const [currentGridId, setCurrentGridId] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isSavingGist, setIsSavingGist] = useState(false);

  const gridState = useMemo(() => 
    currentGridId ? grids[currentGridId] : null, 
    [currentGridId, grids]
  );

  const setGridState: React.Dispatch<React.SetStateAction<GridState | null>> = useCallback((newState) => {
    if (currentGridId) {
      setGrids((prevGrids) => ({
        ...prevGrids,
        [currentGridId]:
          typeof newState === 'function'
            ? (newState(prevGrids[currentGridId]) ?? prevGrids[currentGridId])
            : (newState ?? prevGrids[currentGridId]),
      }));
    }
  }, [currentGridId, setGrids]);

  const getAllGrids = useCallback(() => {
    return Object.entries(grids).map(([id, grid]) => ({
      id,
      title: grid.title,
      rowCount: grid.primaryColumn.filter(cell => !cell.deleted).length,
      columnCount: grid.columns.length + 1,
      createdAt: new Date(),
    }));
  }, [grids]);

  const deleteGrid = useCallback(
    (id: string) => {
      setGrids((prevGrids) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [id]: _, ...rest } = prevGrids;
        return rest;
      });
      if (currentGridId === id) {
        setCurrentGridId(null);
      }
    },
    [setGrids, currentGridId]
  );

  const inititializeGrid = useCallback(async (title: string): Promise<string> => {
    const result = await createPrimaryColumn(title);
    if (!result.success) {
      throw new Error(result.message);
    }

    const newGridId = uuidv4();
    setGrids((prevGrids) => ({
      ...prevGrids,
      [newGridId]: result.grid,
    }));
    setCurrentGridId(newGridId);
    return newGridId;
  }, [createPrimaryColumn, setGrids]);

  const selectRow = useCallback((index: number | null) => {
    if (!gridState) {
      console.warn("Can't select row without grid state!");
      return;
    }
    setSelectedIndex(index);
  }, [gridState]);

  const updateCellState = useCallback((columnTitle: string, cellIndex: number, newCellContents: GridCell) => {
    setGridState((prevState) => {
      if (prevState === null) {
        return null;
      }
      return {
        ...prevState,
        columns: prevState.columns.map((column) => {
          if (column.title === columnTitle) {
            return {
              ...column,
              cells: column.cells.map((c, i) => {
                if (i === cellIndex) {
                  return newCellContents;
                }
                return c;
              }),
            };
          }
          return column;
        }),
      };
    });
  }, [setGridState]);

  const addNewColumn = useCallback(({ title, instructions, type, options, multiple }: NewColumnProps) => {
    if (!gridState) {
      alert("Can't add column without grid state!");
      return;
    }

    const newColumn: GridCol = {
      title,
      type,
      options,
      instructions,
      multiple,
      cells: gridState.primaryColumn.map((primaryCell) => {
        const staticValue = primaryCell.context[title];
        const emptyCellState: GridCell = {
          state: staticValue ? 'done' : 'empty',
          columnTitle: title,
          columnType: type,
          options,
          multiple,
          response: staticValue,
          columnInstructions: instructions,
          context: primaryCell.context,
          hydrationSources: [],
        };

        return emptyCellState;
      }),
    };

    setGridState({
      ...gridState,
      columns: [...gridState.columns, newColumn],
    });

    newColumn.cells.forEach((cell, cellIndex) => {
      if (cell.state !== 'empty') {
        return;
      }
      hydrateCell(cell)
        .then((c) => c.promise)
        .then((hydratedCell) => {
          updateCellState(title, cellIndex, hydratedCell);
        });
    });
  }, [gridState, setGridState, hydrateCell, updateCellState]);

  const deleteColumnByIndex = useCallback((index: number) => {
    setGridState((prevState) => {
      if (prevState === null) {
        return null;
      }
      return {
        ...prevState,
        columns: prevState.columns.filter((_, colIndex) => colIndex !== index),
      };
    });
  }, [setGridState]);

  const setGroupBy = useCallback((columnTitle: string | undefined) => {
    setGridState((prevState) => {
      if (prevState === null) {
        return null;
      }
      return {
        ...prevState,
        groupBy: columnTitle,
      };
    });
  }, [setGridState]);

  const setFilterBy = useCallback((columnTitle: string | undefined, filterValue: string | undefined) => {
    setGridState((prevState) => {
      if (prevState === null) {
        return null;
      }
      return {
        ...prevState,
        filterBy: {
          columnTitle,
          filterValue,
        },
      };
    });
  }, [setGridState]);

  const deleteRow = useCallback(
    (index: number) => {
      setGridState((prevState) => {
        if (!prevState) return null;

        return {
          ...prevState,
          primaryColumn: prevState.primaryColumn.map((cell, i) =>
            i === index ? { ...cell, deleted: true } : cell
          ),
        };
      });
    },
    [setGridState]
  );

  // Memoize markdown generation to avoid expensive recalculations
  const generateMarkdownTable = useCallback((gridState: GridState): string => {
    const headers = ['Primary Column', ...gridState.columns.map((col) => col.title)];

    function escapeMarkdown(text: string): string {
      return text.replace(/\|/g, '\\|').replace(/\n/g, '<br>');
    }

    const fileToMd = (file: { path: string; repository: string }) => {
      const href = `https://github.com/${file.repository}/blob/${file.path}`;
      return `[${file.path}](${href})`;
    };

    function formatCell(response: ColumnResponse[keyof ColumnResponse]): string {
      if (!response) return '';
      if (typeof response === 'string') {
        return escapeMarkdown(response);
      }
      if (typeof response !== 'object') return '';
      if ('options' in response) {
        return response.options.map(escapeMarkdown).join('; ');
      } else if ('option' in response) {
        return escapeMarkdown(response.option);
      } else if ('files' in response) {
        return response.files.map(fileToMd).join('; ');
      } else if ('file' in response) {
        return response.file ? fileToMd(response.file) : '';
      } else if ('user' in response) {
        return escapeMarkdown(response.user);
      } else if ('users' in response) {
        return response.users.map(escapeMarkdown).join('; ');
      } else {
        return '';
      }
    }

    const rows = gridState.primaryColumn
      .filter(cell => !cell.deleted)
      .map((primaryCell, index) => {
        return [
          formatCell(primaryCell.response),
          ...gridState.columns.map((col) => {
            const cell = col.cells[index];
            return formatCell(cell.response as ColumnResponse[keyof ColumnResponse]);
          }),
        ];
      });

    const headerRow = `| ${headers.map(escapeMarkdown).join(' | ')} |`;
    const separatorRow = `| ${headers.map(() => '---').join(' | ')} |`;
    const dataRows = rows.map((row) => `| ${row.join(' | ')} |`);

    return [headerRow, separatorRow, ...dataRows].join('\n');
  }, []);

  const saveGridAsGist = useCallback(async (): Promise<string | null> => {
    if (!gridState) {
      console.warn("Can't save grid without grid state!");
      return null;
    }

    setIsSavingGist(true);
    try {
      const markdownTable = generateMarkdownTable(gridState);
      const filename = `${gridState.title}.md`;
      const gistUrl = await createGist(filename, markdownTable);
      return gistUrl;
    } catch (error) {
      console.error('Failed to save grid as gist:', error);
      return null;
    } finally {
      setIsSavingGist(false);
    }
  }, [gridState, generateMarkdownTable]);

  // Memoize state context value
  const stateValue = useMemo(() => ({
    gridState,
    selectedIndex,
    currentGridId,
    isSavingGist,
  }), [gridState, selectedIndex, currentGridId, isSavingGist]);

  // Memoize actions context value
  const actionsValue = useMemo(() => ({
    setGridState,
    selectRow,
    updateCellState,
    addNewColumn,
    inititializeGrid,
    deleteColumnByIndex,
    setGroupBy,
    setFilterBy,
    setCurrentGridId,
    getAllGrids,
    deleteGrid,
    saveGridAsGist,
    deleteRow,
  }), [
    setGridState,
    selectRow,
    updateCellState,
    addNewColumn,
    inititializeGrid,
    deleteColumnByIndex,
    setGroupBy,
    setFilterBy,
    setCurrentGridId,
    getAllGrids,
    deleteGrid,
    saveGridAsGist,
    deleteRow,
  ]);

  return (
    <GridStateContext.Provider value={stateValue}>
      <GridActionsContext.Provider value={actionsValue}>
        {children}
      </GridActionsContext.Provider>
    </GridStateContext.Provider>
  );
});
