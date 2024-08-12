import React from "react";
import { Avatar, Spinner, Box, Label } from "@primer/react";
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

const avatarUrl = (handle: string, size:number=200) => `https://github.com/${handle}.png?size=${size}`;

function User({handle}:{handle:string}) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
      <Avatar src={avatarUrl(handle)} size={24} />
      <Box sx={{fontWeight: 'semibold', color: 'fg.default'}}>{handle}</Box>
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

  switch (cell.columnType) {
    case "text":
      return (
        <Markdown remarkPlugins={[remarkGfm]} className="markdownContainer">
          {cell.response as string}
        </Markdown>
      );

    case "single-select":
      console.log(cell.response)
      return (
        <Box>
          <Label>{cell.response.option}</Label>
        </Box>
      );

    case "single-select-user":
      return cell.response.user === 'no-user' ? (
        <>No user selected</>
      ) : (
        <User handle={cell.response.user} />
      );

    case "multi-select-user":
      return (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          {cell.response.users.length > 0 ? (
            <>
              {cell.response.users.map((handle: string, index: number) => (
                <User handle={handle} key={index} />
              ))}
            </>
          ) : (
            <>No user selected</>
          )}
        </Box>
      );

    case "multi-select":
      return (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          {cell.response.options.map((option: string, index: number) => (
            <Label key={index}>{option}</Label>
          ))}
        </Box>
      );

    default:
      return null;
  }
}
