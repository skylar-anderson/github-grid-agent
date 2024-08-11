"use client"
import { useCallback, useRef, useState } from "react";
import type { GridCol, GridCell } from "../actions";
import { Dialog } from "@primer/react/experimental";
import { Spinner, Box, Button } from "@primer/react";
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
        sx={{ flex: 1 }}
      />
      {columns.map((column, colIndex) => (
        <Cell
          key={colIndex}
          cell={column.cells[rowIndex]}
          isSelected={selectedIndex === rowIndex}
          sx={{ flex: 1 }}
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
      <Button
        variant="primary"
        onClick={() => setShowNewColumnForm(true)}
      >
        Add column
      </Button>
    </Box>
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
    <Box sx={{ flex: 1, p: 2, display: "flex", flexDirection: "column" }}>
      <GridHeader title={title} setShowNewColumnForm={setShowNewColumnForm}/>
      <Box
        sx={{
          display: "flex",
          flex: 1,
          overflow: "scroll",
          gap: 2,
        }}
      >
        <Panel sx={{ flex: 1, height: "100%" }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              borderBottom: "1px solid",
              borderColor: "border.default",
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