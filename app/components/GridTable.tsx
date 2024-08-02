import { useCallback, useRef, useState } from "react";
import type { GridPrimaryCell, GridCol } from "../actions";
import { Dialog } from "@primer/react/experimental";
import { Spinner, Box, Button } from "@primer/react";
import { useGridContext } from "./GridContext";
import SelectedContext from "./SelectedContext";
import NewColumnForm from "./NewColumnForm";
import GridCell from "./GridCell";
import "./Grid.css";

type PrimaryColumnProps = {
  primaryColumn: GridPrimaryCell[];
  title: string;
  selectRow: (n: number) => void;
  selectedIndex: number | null;
};

export function PrimaryColumn({
  primaryColumn,
  title,
  selectRow,
  selectedIndex,
}: PrimaryColumnProps) {
  return (
    <Column>
      <ColumnTitle title={title} />
      {primaryColumn.map((cell: GridPrimaryCell, cellIndex: number) => (
        <GridCell
          isSelected={selectedIndex === cellIndex}
          onClick={() => {
            selectRow(cellIndex);
          }}
        >
          <Box sx={{ fontWeight: "semibold" }}>{cell.displayValue}</Box>
        </GridCell>
      ))}
    </Column>
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
function ColumnTitle({ title }: { title: string }) {
  return (
    <Box
      sx={{
        py: "12px",
        px: 3,
        zIndex: 1,
        position: "sticky",
        top: 0,
        fontSize: 1,
        backgroundColor: "white",
        color: "fg.default",
        fontWeight: "semibold",
        borderBottom: "1px solid",
        borderColor: "border.default",
      }}
    >
      {title}
    </Box>
  );
}

function Columns({ children }: { children: React.ReactNode }) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
      }}
    >
      {children}
    </Box>
  );
}

function Column({ children }: { children: React.ReactNode }) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        position: "relative",
        flex: 1,
        borderRight: "1px solid",
        borderColor: "border.default",
        "&:last-child": {
          border: 0,
        },
      }}
    >
      {children}
    </Box>
  );
}

export default function GridTable() {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const onDialogClose = useCallback(() => setShowNewColumnForm(false), []);
  const [showNewColumnForm, setShowNewColumnForm] = useState<boolean | null>();
  const { gridState, addNewColumn, selectRow, selectedIndex } =
    useGridContext();
  if (!gridState) {
    return null;
  }
  const { columns, title, primaryColumn, primaryColumnType } = gridState;

  return (
    <Box sx={{ flex: 1, p: 2, display: "flex", flexDirection: "column" }}>
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
          {showNewColumnForm}
        </Box>
        <Button
          ref={buttonRef}
          variant="primary"
          onClick={() => setShowNewColumnForm(true)}
        >
          Add column
        </Button>
      </Box>
      <Box
        sx={{
          display: "flex",
          flex: 1,
          overflow: "scroll",
          gap: 2,
        }}
      >
        <Panel sx={{ flex: 1, height: "100%" }}>
          <Columns>
            <PrimaryColumn
              primaryColumn={primaryColumn}
              title={primaryColumnType}
              selectRow={selectRow}
              selectedIndex={selectedIndex}
            />
            {columns.map((column: GridCol, rowIndex: number) => (
              <Column key={rowIndex}>
                <ColumnTitle title={column.title} />
                {column.cells.map((cell, cellIndex: number) => (
                  <GridCell
                    key={cellIndex}
                    isSelected={selectedIndex === cellIndex}
                  >
                    {cell.state === "done" ? (
                      <>{cell.displayValue}</>
                    ) : (
                      <Spinner size="small" />
                    )}
                  </GridCell>
                ))}
              </Column>
            ))}
          </Columns>
        </Panel>

        {selectedIndex !== null && (
          <Panel sx={{ flex: 0, minWidth: "640px", height: "100%" }}>
            <SelectedContext />
          </Panel>
        )}
      </Box>

      {showNewColumnForm ? (
        <Dialog title="Add new column" position="right" onClose={onDialogClose}>
          <NewColumnForm addNewColumn={({title, instructions}) => {
            addNewColumn({title, instructions})
            setShowNewColumnForm(false)
            return;
          }} />
        </Dialog>
      ) : null}
    </Box>
  );
}
