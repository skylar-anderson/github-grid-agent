import { useState } from "react";
import { IconButton, Box, Button } from "@primer/react";
import {
  XIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ChevronRightIcon,
} from "@primer/octicons-react";
import { GridCol, GridCell } from "../actions";
import { useGridContext } from "./GridContext";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "./SelectedContext.css";

function Prompt({ prompt }: { prompt: string }) {
  const [open, setOpen] = useState<boolean>(false);
  return (
    <Box sx={{
      display: "flex",
      flexDirection: "column",
      backgroundColor: "canvas.inset",
      borderRadius: 2,
      }}
    >
      <Box
        sx={{
          display: "flex",
          p: 2,
          flexDirection: "row",
          alignItems: "center",
          gap: 1,
          borderBottom: open ? '1px solid' : '0',
          borderColor: 'border.default',
          cursor: 'pointer',
          
        }}
        onClick={() => setOpen(!open)}
      >
        <IconButton
          onClick={() => setOpen(!open)}
          size="small"
          variant="invisible"
          aria-label={open ? "Close prompt" : "Open prompt"}
          icon={open ? ChevronDownIcon : ChevronRightIcon}
        />
        <Box sx={{ fontSize: 0, color: "fg.muted" }}>Prompt</Box>
      </Box>
      {open && <Box sx={{p: 2}}>
        <Box as="pre" sx={{
          wordWrap: 'break-word',
          fontSize: 0,
          p: 0,
          m: 0,
          fontFamily: 'mono',
          whiteSpace: 'pre-wrap',
          lineHeight: '22px',
          }}
        >
          {prompt}
        </Box>
      </Box>}
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
        borderRadius: 2,
        overflow: "hidden",
        border: "1px solid",
        borderColor: "border.default",
      }}
    >
      <Box
        sx={{
          m: 0,
          px: 3,
          py: 2,
          backgroundColor: "canvas.inset",
          borderBottom: "1px solid",
          borderColor: "border.default",
          display: "flex",
          flexDirection: "row",
          alignItems: "baseline",
        }}
      >
        <Box sx={{ fontSize: 1, fontWeight: "semibold", pr: 2 }}>
          {column.title}
        </Box>

        <Box sx={{ color: "fg.muted", fontFamily: "mono", fontSize: 0 }}>
          Using{" "}
          {sources.length > 0 ? sources.join(", ") : `original ${contextType}`}
        </Box>
      </Box>

      <Box sx={{ p: 3, gap: 3}}>
        <Markdown remarkPlugins={[remarkGfm]} className="markdownContainer">
          {cell.displayValue || ""}
        </Markdown>
        <Prompt prompt={`${column.title}\n${column.instructions}`} />
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
      <Box sx={{ flex: 1, fontSize: 1, fontWeight: "semibold" }}>{title}</Box>
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

export default function SelectedContext() {
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
  const [showDetails, setShowDetails] = useState<boolean>(false);

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
        title={primaryCell.displayValue}
        next={nextRow}
        previous={previousRow}
        close={() => selectRow(null)}
      />

      <Box
        sx={{
          flex: 1,
          p: 3,
          gap: 3,
          display: "flex",
          flexDirection: "column",
          overflow: "scroll",
        }}
      >
        {columns.map((c, i) => (
          <CellValue
            key={`cell-${i}`}
            column={c}
            contextType={primaryCell.context.type}
            cell={c.cells[selectedIndex]}
          />
        ))}

        {showDetails ? (
          <div className="details details--open">
            {Object.keys(primaryCell.context).map((k) => {
              const value = primaryCell.context[k];
              return (
                <div className="selected-context-section" key={k}>
                  <Box
                    sx={{ fontSize: 2, fontWeight: "semibold", m: 0, pb: 2 }}
                  >
                    {k}
                  </Box>
                  <Markdown
                    remarkPlugins={[remarkGfm]}
                    className="markdownContainer"
                  >
                    {value ? value.toString() : ""}
                  </Markdown>
                </div>
              );
            })}
            <Box sx={{ p: 3 }}>
              <Button onClick={() => setShowDetails(false)}>
                Hide details
              </Button>
            </Box>
          </div>
        ) : (
          <Box sx={{ p: 3 }}>
            <Button onClick={() => setShowDetails(true)}>
              Show {primaryCell.context.type} details
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
}
