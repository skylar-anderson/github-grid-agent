import { useState } from "react";
import { IconButton, Box, Avatar, Text } from "@primer/react";
import DebugDialog from "./DebugDialog";
import {
  XIcon,
  ChevronDownIcon,
  ChevronUpIcon,  
} from "@primer/octicons-react";
import { GridCol, GridCell } from "../actions";
import { useGridContext } from "./GridContext";
import "./SelectedContext.css";
import { GridCellContent } from "./Cell";
import { marked } from 'marked';

const avatarUrl = (handle: string, size: number = 200) =>
  `https://github.com/${handle}.png?size=${size}`;
/*
assignee_handle
siddharthkp
assignee_avatar
https://avatars.githubusercontent.com/u/1863771?v=4
assignee_url
https://github.com/siddharthkp
opener_handle
DavidMeu
state
open
title
[ActionMenu.Button] onClick doesn't function
body
### Description When trying to pass a function to `ActionMenu.Button ` it doesn't get invoked. ![Image](https://github.com/primer/react/assets/35102691/c6d77c3e-64b5-43c1-9d78-c3e28fa235ef) ### Steps to reproduce 1. Goto: https://primer.style/react/ActionMenu 2. Overload `onClick` and see it doesn't get invoked on clicking. ### Version ^36.19.1 ### Browser _No response_
number
4647
url
https://github.com/primer/react/issues/4647*/

type Issue = {
  assignee_handle: string;
  assignee_avatar: string;
  assignee_url: string;
  opener_handle: string;
  state: string;
  title: string;
  body: string;
  number: string;
  url: string;
}
function IssueDetails({ issue }: { issue: Issue }) {
  const [open, setOpen] = useState<boolean>(false);
  
  return (
    <Box sx={{ p: 3 }}>
      <Box
        as="a"
        href={issue.url}
        sx={{
          display: 'block',
          color: "fg.default",
          textDecoration: 'none',
          fontSize: 4,
          fontWeight: "semibold",
          lineHeight: 1.33,
          mb: 3}}
        >
          {issue.title}<Text sx={{color: 'fg.muted'}}>(#{issue.number})</Text></Box>
      <Box sx={{ fontSize: 0, border: "1px solid", borderColor: "border.default", borderRadius: 2, overflow: "hidden"}}>
        <Box sx={{ px: 3, py: 2, backgroundColor: "canvas.inset", display: "flex", alignItems: "center", gap: 1, borderBottom: "1px solid", borderColor: "border.default"}}>
          <Avatar src={avatarUrl(issue.opener_handle)} size={20} sx={{mr: 1}} />
          <Text sx={{color: 'fg.default', fontWeight: 'semibold'}}>
            {issue.opener_handle}
          </Text> <Text sx={{color: 'fg.muted'}}>opened this issue on {new Date(issue.url).toLocaleDateString()}</Text>
        </Box>
        <Box sx={{ p: 3, maxHeight: open ? "none" : "225px", overflow: "hidden", position: "relative", transition: "max-height 0.3s ease" }}>
          <div className="markdownContainer" dangerouslySetInnerHTML={{ __html: marked.parse(issue.body) }} />
          {open ? (
            <IconButton
              icon={ChevronUpIcon}
              aria-label="Show less" 
              onClick={() => setOpen(false)}
              sx={{
                position: "absolute",
                bottom: 2,
                right: 2,
                backgroundColor: "canvas.default"
              }}
            />
          ) : (
            <IconButton
              icon={ChevronDownIcon}
              aria-label="Show more"
              onClick={() => setOpen(true)}
              sx={{
                position: "absolute",
                bottom: 2,
                right: 2,
                backgroundColor: "canvas.default"
              }}
            />
          )}
        </Box>
      </Box>
    </Box>
  )
}

function ContextDetails({ primaryCell }: { primaryCell: GridCell }) {
  const [open, setOpen] = useState<boolean>(true);
  const { context } = primaryCell
  
  if (context.type === 'issue') {
    return <IssueDetails issue={context as Issue} />
  }
  return (
    <Box
      sx={{
        flexShrink: 0,
        overflow: "hidden",
      }}
    >

      <Box sx={{ fontSize: 1, fontWeight: "semibold", px: 3, pt: 3}}>
        Original {context.type} details
      </Box>

      {open && (
        <Box sx={{ p: 3 }}>
          {Object.keys(context).map((key) => {
            const value = context[key];
            if (key === "type" || key === "value") return null;
            return (
              <Box sx={{ pb: 3, "&:last-child": { pb: 0 } }} key={key}>
                <Box sx={{ fontSize: 0, fontWeight: "semibold", m: 0, pb: 0 }}>
                  {key}
                </Box>

                <Box sx={{ fontSize: 0, color: "fg.muted" }}>{value}</Box>
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
}

function CellValue({
  column,
  cell,
  contextType,
}: {
  column: GridCol;
  cell: GridCell;
  contextType: string;
}) {
  const sources = cell.hydrationSources;
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 1
      }}
    >

      <Box sx={{ fontSize: 1, fontWeight: "semibold" }}>
        {column.title} <DebugDialog prompt={cell.prompt || ""} sources={sources} />
      </Box>

      <Box sx={{ flexDirection: "column", display: "flex", flex: 1,gap: 1 }}>
        <GridCellContent cell={cell} />
      </Box>
    </Box>
  );
}

type HeaderProps = {
  next: () => void;
  previous: () => void;
  close: () => void;
  title: string;
};
function ContextHeader({ title, next, previous, close }: HeaderProps) {
  return (
    <Box
      sx={{
        display: "flex",
        p: 2,
        gap: 2,
        borderBottom: "1px solid",
        borderColor: "border.default",
        alignItems: "center",
        position: "sticky",
        top: 0,
        left: 0,
        backgroundColor: "canvas.default",
        height: '48px',
      }}
    >
      <Box sx={{ display: "flex", gap: 0 }}>
        <IconButton
          aria-label="Previous"
          size="small"
          variant="invisible"
          icon={ChevronUpIcon}
          onClick={previous}
        />
        <IconButton
          aria-label="Next"
          size="small"
          variant="invisible"
          icon={ChevronDownIcon}
          onClick={next}
        />
      </Box>

      <Box
        sx={{
          flex: 1,
          fontSize: 1,
          fontWeight: "semibold",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {title}
      </Box>

      <IconButton
        icon={XIcon}
        size="small"
        variant="invisible"
        aria-label="Close"
        onClick={close}
      />
    </Box>
  );
}

export default function SelectedRowPanel() {
  const { gridState, selectRow, selectedIndex } = useGridContext();
  if (!gridState) {
    return null;
  }
  if (selectedIndex === null) {
    return null;
  }

  const { columns } = gridState;

  const primaryColumn = gridState.primaryColumn;
  const primaryCell = primaryColumn[selectedIndex];

  function previousRow() {
    if (selectedIndex === null) {
      return null;
    }
    const targetRow =
      selectedIndex === 0 ? primaryColumn.length - 1 : selectedIndex - 1;
    selectRow(targetRow);
  }

  function nextRow() {
    if (selectedIndex === null) {
      return null;
    }
    const targetRow =
      selectedIndex === primaryColumn.length - 1 ? 0 : selectedIndex + 1;
    selectRow(targetRow);
  }

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <ContextHeader
        title={primaryCell.response as string}
        next={nextRow}
        previous={previousRow}
        close={() => selectRow(null)}
      />

      <Box
        sx={{
          flex: 1,
          height: "100%",
          overflow: "scroll",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <ContextDetails primaryCell={primaryCell} />

        {columns.map((c, i) => (
          <Box key={`cell-${i}`} sx={{p:3}}>
            <CellValue
              column={c}
              contextType={primaryCell.context.type}
              cell={c.cells[selectedIndex]}
            />
          </Box>
        ))}
      </Box>
    </Box>
  );
}
