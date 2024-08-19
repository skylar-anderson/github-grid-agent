import { BaseColumnType } from '../columns/BaseColumnType';
import React from "react";
import { Spinner, Box } from "@primer/react";
import type { GridCell, GridCellBase, ColumnResponse } from "../actions";
import { columnTypes } from '../columns';

type CellProps = {
  sx?: any;
  cell: GridCell;
  onClick?: () => void;
  isSelected?: boolean;
};

export default function Cell({
  sx,
  cell,
  onClick,
  isSelected = false,
}: CellProps) {
  const hoverProps = onClick
    ? {
        ":hover": {
          backgroundColor: "canvas.inset",
          cursor: "pointer",
          transition: "background-color 300ms ease-in-out",
        },
      }
    : {};
  const selectedProps = {
    backgroundColor: "canvas.inset",
  };

  return (
    <Box
      sx={{
        wordWrap: "break-word",
        display: "flex",
        flexShrink: 0,
        overflowY: "scroll",
        flexDirection: "column",
        position: "relative",
        p: 3,
        fontSize: 1,
        flex: 1,
        boxSizing: "border-box",
        minWidth: "260px",
        borderRight: "1px solid",
        borderColor: "#f0f0f0",
        overflow: "hidden",
        "&:last-child": {
          border: 0,
        },
        ...(isSelected ? selectedProps : {}),
        ...hoverProps,
        ...sx,
      }}
      onClick={onClick}
    >
      <GridCellContent cell={cell} />
    </Box>
  );
}

export function GridCellContent({ cell }: { cell: GridCell }) {
  if (cell.state === "error") {
    return cell.errorMessage;
  }
  if (cell.state === "empty") {
    return <Spinner size="small" />;
  }

  const columnType = columnTypes[cell.columnType] as BaseColumnType<ColumnResponse>;
  return columnType.renderCell(cell as GridCellBase<ColumnResponse>);
}