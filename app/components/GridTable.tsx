"use client"
import { useCallback, useRef, useState } from "react";
import type { GridCol, GridCell } from "../actions";
import { Dialog } from "@primer/react/experimental";
import { ActionMenu, ActionList, Box, Button } from "@primer/react";
import { useGridContext } from "./GridContext";
import SelectedContext from "./SelectedContext";
import NewColumnForm from "./NewColumnForm";
import Cell from "./Cell";
import "./Grid.css";
import ColumnTitle from "./ColumnTitle";

type RowProps = {
  rowIndex: number;
  primaryCell: GridCell;
  columns: GridCol[];
  selectRow: (n: number) => void;
  selectedIndex: number | null;
};

function Row({ rowIndex, primaryCell, columns, selectRow, selectedIndex }: RowProps) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        borderBottom: "1px solid",
        borderColor: "border.default",
        "&:last-child": {
          borderBottom: 0,
        },
        '&:hover': {
          backgroundColor: 'canvas.inset',
          cursor: 'pointer'
        }
      }}
      onClick={() => selectRow(rowIndex)}
    >
      <Cell
        cell={primaryCell}
        isSelected={selectedIndex === rowIndex}
      />
      {columns.map((column, colIndex) => (
        <Cell
          key={colIndex}
          cell={column.cells[rowIndex]}
          isSelected={selectedIndex === rowIndex}
        />
      ))}
    </Box>
  );
}

function Panel({ children, sx = {} }: { children: React.ReactNode; sx?: any }) {
  return (
    <Box
      sx={{
        flex: 1,
        backgroundColor: "white",
        borderRadius: 2,
        border: "1px solid",
        boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
        borderColor: "border.default",
        overflow: "scroll",
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}
type GridHeaderProps = {
  title: string;
  setShowNewColumnForm: (b:boolean) => void;
}
function GridHeader({title, setShowNewColumnForm}:GridHeaderProps) {
  return (
    <Box
      sx={{
        pb: 2,
        display: "flex",
        flexDirection: "row",
        gap: 2,
        justifyContent: "center",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          flex: 1,
          fontWeight: "semibold",
          fontSize: 1,
          color: "fg.default",
        }}
      >
        {title}
      </Box>
      <Box sx={{display: 'flex', gap: 2}}>
        <GroupBy />
        <FilterBy />
        <Button
          variant="primary"
          onClick={() => setShowNewColumnForm(true)}
        >
          Add column
        </Button>
      </Box>
    </Box>
  )
}

function GroupBy() {
  const { gridState } = useGridContext();
  if (!gridState) { return null }

  const groupableColumnTypes = ['multi-select', 'single-select'];
  const groupableColumns = gridState.columns.filter(column => groupableColumnTypes.includes(column.type));
  if (gridState && groupableColumns.length === 0) { return null }
  return (
    <ActionMenu>
        <ActionMenu.Button>
          Group by
        </ActionMenu.Button>
        <ActionMenu.Overlay width="medium">
          <ActionList>
            {groupableColumns.map((column, index) => (
              <ActionList.Item key={index} onSelect={() => alert(`Group by ${column.title}`)}>
                {column.title}
              </ActionList.Item>
            ))}
          </ActionList>
        </ActionMenu.Overlay>
      </ActionMenu>
  )
}

function FilterBy() {
  const { gridState } = useGridContext();
  if (!gridState) { return null }

  const filterableColumnTypes = ['multi-select', 'single-select'];
  const filterableColumns = gridState.columns.filter(column => filterableColumnTypes.includes(column.type));
  if (gridState && filterableColumns.length === 0) { return null }
  return (
    <ActionMenu>
        <ActionMenu.Button>
          Filter
        </ActionMenu.Button>
        <ActionMenu.Overlay width="medium">
          <ActionList>
            {filterableColumns.map((column, index) => (
              <ActionList.Item key={index} onSelect={() => alert(`Group by ${column.title}`)}>
                {column.title}
              </ActionList.Item>
            ))}
          </ActionList>
        </ActionMenu.Overlay>
      </ActionMenu>
  )
}

export default function GridTable() {
  const onDialogClose = useCallback(() => setShowNewColumnForm(false), []);
  const [showNewColumnForm, setShowNewColumnForm] = useState<boolean | null>();
  const { gridState, addNewColumn, selectRow, selectedIndex } = useGridContext();

  if (!gridState) {
    return null;
  }

  const { columns, title, primaryColumn, primaryColumnType } = gridState;

  return (
    <Box sx={{ flex: 1, p: 2, display: "flex", flexDirection: "column", width: '100%'}}>
      <GridHeader title={title} setShowNewColumnForm={setShowNewColumnForm}/>
      <Box
        sx={{
          display: "flex",
          flex: 1,
          overflow: "scroll",
          gap: 2,
        }}
      >
        <Panel sx={{ flex: 1, height: "100%", overflowX: 'scroll' }}>
          <Box sx={{ minWidth: '100%', display: 'flex', flex: 1, flexDirection: 'column'}}>
            <Box
              sx={{
                display: "flex",
                position: 'sticky',
                top: 0,
                flexDirection: "row",
                borderBottom: "1px solid",
                borderColor: "border.default",
                background: 'canvas.default',
                flex: 1,
                zIndex: 1,
              }}
            >
              <ColumnTitle title={primaryColumnType} />
              {columns.map((column: GridCol, index: number) => (
                <ColumnTitle key={index} title={column.title} index={index} />
              ))}
            </Box>
            {primaryColumn.map((primaryCell, rowIndex) => (
              <Row
                key={rowIndex}
                rowIndex={rowIndex}
                primaryCell={primaryCell}
                columns={columns}
                selectRow={selectRow}
                selectedIndex={selectedIndex}
              />
            ))}
          </Box>
        </Panel>

        {selectedIndex !== null && (
          <Panel sx={{ flex: 0, minWidth: "640px", height: "100%" }}>
            <SelectedContext />
          </Panel>
        )}
      </Box>

      {showNewColumnForm ? (
        <Dialog title="Add new column" position="right" onClose={onDialogClose}>
          <NewColumnForm
            addNewColumn={({ title, instructions, type, options }) => {
              addNewColumn({ title, instructions, type, options });
              setShowNewColumnForm(false);
              return;
            }}
          />
        </Dialog>
      ) : null}
    </Box>
  );
}