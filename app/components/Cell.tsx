import React from "react";
import { Spinner, Box, Label } from "@primer/react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { GridCell } from "../actions";

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
        boxSizing: "border-box",
        minWidth: "var(--cell-width)",
        height: "var(--cell-height)",
        borderBottom: "1px solid",
        borderColor: "border.default",
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

  if (cell.columnType === "text") {
    return (
      <Markdown remarkPlugins={[remarkGfm]} className="markdownContainer">
        {cell.response as string}
      </Markdown>
    );
  }
  if (cell.columnType === "single-select") {
    return <Box><Label>{cell.response.option}</Label></Box>;
  }
  if (cell.columnType === "multi-select") {
    return (
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
        {cell.response.options.map((option: string, index: number) => (
          <Label key={index}>{option}</Label>
        ))}
      </Box>
    );
  }
}
