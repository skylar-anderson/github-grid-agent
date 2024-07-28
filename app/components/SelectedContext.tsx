import { useState } from "react";
import { Button } from "@primer/react";
import { GridCol, GridCell, GridState } from "../actions";
import { useGridContext } from "./GridContext";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "./SelectedContext.css";

function CellValue({ column, cell }: { column: GridCol; cell: GridCell }) {
  const sources = cell.hydrationSources;
  const [open, setOpen] = useState<boolean>(false);
  return (
    <div className="selected-context-section">
      <h3 className="section-title" title={column.instructions}>
        {column.title}
      </h3>

      {sources.length > 0 && (
        <div className="sources">Using {sources.join(", ")}</div>
      )}

      <div className="cell-value">
        <Markdown remarkPlugins={[remarkGfm]} className="markdownContainer">
          {cell.displayValue || ""}
        </Markdown>
      </div>
      {open ? (
        <div>
          <pre className="instructions">{column.instructions}</pre>
          <Button onClick={() => setOpen(false)}>Hide prompt</Button>
        </div>
      ) : (
        <Button onClick={() => setOpen(true)}>Show prompt</Button>
      )}
    </div>
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
    <div className="selected-context">
      <div className="header">
        <div className="header-nav">
          <Button className=" next-prev" onClick={previousRow}>
            ↑
          </Button>
          <Button className="button next-prev" onClick={nextRow}>
            ↓
          </Button>
        </div>
        <div className="header-title">{primaryCell.displayValue}</div>
        <Button className="header-close" onClick={() => selectRow(null)}>
          Close
        </Button>
      </div>

      <div className="body">
        {columns.map((c, i) => (
          <CellValue column={c} cell={c.cells[selectedIndex]} />
        ))}

        {showDetails ? (
          <div className="details details--open">
            {Object.keys(primaryCell.context).map((k) => {
              const value = primaryCell.context[k];
              return (
                <div className="selected-context-section" key={k}>
                  <h3 className="section-title">{k}</h3>
                  <Markdown
                    remarkPlugins={[remarkGfm]}
                    className="markdownContainer"
                  >
                    {value ? value.toString() : ""}
                  </Markdown>
                </div>
              );
            })}
            <div className="more-details">
              <Button onClick={() => setShowDetails(false)}>
                Hide details
              </Button>
            </div>
          </div>
        ) : (
          <div className="more-details">
            <Button onClick={() => setShowDetails(true)}>
              Show {primaryCell.context.type} details
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
