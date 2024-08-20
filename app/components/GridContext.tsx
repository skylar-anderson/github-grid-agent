import React, {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  SuccessfulPrimaryColumnResponse,
  ErrorResponse,
  GridState,
  GridCell,
} from "../actions";
import type { ColumnType, GridCol, Option } from "../actions";
import useLocalStorage from "../utils/local-storage";
import { v4 as uuidv4 } from 'uuid';

type GridContextType = {
  gridState: GridState | null;
  setGridState: React.Dispatch<React.SetStateAction<GridState | null>>;
  selectRow: (index: number | null) => void;
  updateCellState: (
    columnTitle: string,
    cellIndex: number,
    newCellContents: GridCell,
  ) => void;
  addNewColumn: (props: NewColumnProps) => void;
  inititializeGrid: (s: string) => Promise<string>;
  selectedIndex: number | null;
  deleteColumnByIndex: (index: number) => void;
  setGroupBy: (columnTitle: string | undefined) => void;
  setFilterBy: (
    columnTitle: string | undefined,
    filterValue: string | undefined,
  ) => void;
  currentGridId: string | null;
  setCurrentGridId: (id: string) => void;
  getAllGrids: () => { id: string; title: string }[];
  deleteGrid: (id: string) => void;
};

type NewColumnProps = {
  title: string;
  instructions: string;
  type: ColumnType;
  options: Option[];
  multiple?: boolean;
};

const GridContext = createContext<GridContextType | undefined>(undefined);

export const useGridContext = () => {
  const context = useContext(GridContext);
  if (context === undefined) {
    throw new Error("useGridContext must be used within a GridProvider");
  }
  return context;
};

type ProviderProps = {
  hydrateCell: (cell: GridCell) => Promise<{ promise: Promise<GridCell> }>;
  createPrimaryColumn: (
    s: string,
  ) => Promise<SuccessfulPrimaryColumnResponse | ErrorResponse>;
  children: ReactNode;
};

export const GridProvider = ({
  createPrimaryColumn,
  hydrateCell,
  children,
}: ProviderProps) => {
  const [grids, setGrids] = useLocalStorage<Record<string, GridState>>("grids", {});
  const [currentGridId, setCurrentGridId] = useState<string | null>(null);

  const gridState = currentGridId ? grids[currentGridId] : null;

  const setGridState: React.Dispatch<React.SetStateAction<GridState | null>> = (newState) => {
    if (currentGridId) {
      setGrids(prevGrids => ({
        ...prevGrids,
        [currentGridId]: typeof newState === 'function' 
          ? newState(prevGrids[currentGridId]) ?? prevGrids[currentGridId]
          : newState ?? prevGrids[currentGridId]
      }));
    }
  };

  const getAllGrids = useCallback(() => {
    return Object.entries(grids).map(([id, grid]) => ({
      id,
      title: grid.title
    }));
  }, [grids]);

  const deleteGrid = useCallback((id: string) => {
    setGrids(prevGrids => {
      const { [id]: _, ...rest } = prevGrids;
      return rest;
    });
    if (currentGridId === id) {
      setCurrentGridId(null);
    }
  }, [setGrids, currentGridId]);

  async function inititializeGrid(title: string): Promise<string> {
    const result = await createPrimaryColumn(title);
    if (!result.success) {
      throw new Error(result.message);
    }

    const newGridId = uuidv4();
    setGrids(prevGrids => ({
      ...prevGrids,
      [newGridId]: result.grid
    }));
    setCurrentGridId(newGridId);
    return newGridId;
  }

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const selectRow = (index: number | null) => {
    if (!gridState) {
      console.warn("Can't select row without grid state!");
      return;
    }
    setSelectedIndex(index);
  };

  function addNewColumn({
    title,
    instructions,
    type,
    options,
    multiple,
  }: NewColumnProps) {
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
          state: staticValue ? "done" : "empty",
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
      if (cell.state !== "empty") {
        return;
      }
      hydrateCell(cell)
        .then((c) => c.promise)
        .then((hydratedCell) => {
          updateCellState(title, cellIndex, hydratedCell);
        });
    });
  }

  const deleteColumnByIndex = (index: number) => {
    setGridState((prevState) => {
      if (prevState === null) {
        return null;
      }
      return {
        ...prevState,
        columns: prevState.columns.filter((_, colIndex) => colIndex !== index),
      };
    });
  };

  const setGroupBy = (columnTitle: string | undefined) => {
    setGridState((prevState) => {
      if (prevState === null) {
        return null;
      }
      return {
        ...prevState,
        groupBy: columnTitle,
      };
    });
  };

  const setFilterBy = (
    columnTitle: string | undefined,
    filterValue: string | undefined,
  ) => {
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
  };

  const updateCellState = (
    columnTitle: string,
    cellIndex: number,
    newCellContents: GridCell,
  ) => {
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
  };

  return (
    <GridContext.Provider
      value={{
        inititializeGrid,
        selectedIndex,
        gridState,
        setGridState,
        selectRow,
        updateCellState,
        addNewColumn,
        deleteColumnByIndex,
        setGroupBy,
        setFilterBy,
        currentGridId,
        setCurrentGridId,
        getAllGrids,
        deleteGrid,
      }}
    >
      {children}
    </GridContext.Provider>
  );
};