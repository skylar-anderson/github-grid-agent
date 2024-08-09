import React from "react";
import { Box, Label } from "@primer/react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ColumnType } from "../actions";

type GridCellProps = {
  sx?: any;
  children: React.ReactNode;
  onClick?: () => void;
  isSelected?: boolean;
  columnType: ColumnType;
};

export default function GridCell({
  sx,
  children,
  onClick,
  isSelected = false,
  columnType,
}: GridCellProps) {
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

  const renderContent = () => {
    if (columnType === "text") {
      return (
        <Markdown remarkPlugins={[remarkGfm]} className="markdownContainer">
          {children as string}
        </Markdown>
      );
    } else if (columnType === "single-select") {
      return <Label>{children as string}</Label>;
    } else if (columnType === "multi-select") {
      return (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          {(children as string[]).map((option, index) => (
            <Label key={index}>{option}</Label>
          ))}
        </Box>
      );
    }
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
      {renderContent()}
    </Box>
  );
}