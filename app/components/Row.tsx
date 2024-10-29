import { Box } from "@primer/react";
import Cell from "./Cell";
import type { GridCol, GridCell } from "../actions";

type RowProps = {
  rowIndex: number;
  primaryCell: GridCell;
  columns: GridCol[];
  selectRow: (n: number) => void;
  selectedIndex: number | null;
};

export default function Row({
  rowIndex,
  primaryCell,
  columns,
  selectRow,
  selectedIndex,
}: RowProps) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        borderBottom: "1px solid",
        borderColor: "#f0f0f0",
        transition: "background-color 300ms ease-in-out",
        "&:hover": {
          backgroundColor: "canvas.inset",
          borderColor: "border.default",
          cursor: "pointer",
        },
      }}
      onClick={() => selectRow(rowIndex)}
    >
      <Cell cell={primaryCell} isSelected={selectedIndex === rowIndex} />
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