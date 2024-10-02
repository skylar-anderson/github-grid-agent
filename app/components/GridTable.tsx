"use client";
import { useMemo, useCallback, useState } from "react";
import type { GridCol, GridCell, ColumnResponse } from "../actions";
import { Dialog } from "@primer/react/experimental";
import { Text, Box, CounterLabel } from "@primer/react";
import { GridHeader } from "./GridHeader";
import { useGridContext } from "./GridContext";
import SelectedContext from "./SelectedContext";
import NewColumnForm from "./NewColumnForm";
import Cell from "./Cell";
import "./Grid.css";
import ColumnTitle from "./ColumnTitle";
import { pluralize } from "../utils/pluralize";
import { capitalize } from "../utils/capitalize";
type RowProps = {
  rowIndex: number;
  primaryCell: GridCell;
  columns: GridCol[];
  selectRow: (n: number) => void;
  selectedIndex: number | null;
};

function Row({
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

function GroupHeader({
  groupName,
  count,
}: {
  groupName: string;
  count: number;
}) {
  return (
    <Box
      sx={{
        backgroundColor: "canvas.subtle",
        fontSize: 1,
        p: 2,
        px: 3,
        color: "fg.muted",
        fontWeight: "bold",
        borderBottom: "1px solid",
        flex: 2,
        position: "sticky",
        top: "49px",
        zIndex: 1,
        borderColor: "border.default",
      }}
    >
      <Text sx={{ mr: 2 }}>
        {count === 1 ? groupName : pluralize(groupName)}
      </Text>
      <CounterLabel>{count}</CounterLabel>
    </Box>
  );
}

export default function GridTable() {
  const onDialogClose = useCallback(() => setShowNewColumnForm(false), []);
  const [showNewColumnForm, setShowNewColumnForm] = useState<boolean | null>();
  const { gridState, addNewColumn, selectRow, selectedIndex } =
    useGridContext();

  const groupedRows = useMemo(() => {
    if (!gridState) {
      return [];
    }

    const { columns, primaryColumn, groupBy } = gridState;
    const defaultGroup = {
      groupName: "",
      rows: primaryColumn.map((cell, index) => ({ cell, index })),
    };

    if (!groupBy) {
      return [defaultGroup];
    }

    const groupColumn = columns.find((col) => col.title === groupBy);
    if (!groupColumn) {
      return [defaultGroup];
    }

    const groups: { [key: string]: { cell: GridCell; index: number }[] } = {};

    primaryColumn.forEach((cell, index) => {
      const groupCell = groupColumn.cells[index];
      let groupValues: string[] = [];
      switch (groupColumn.type) {
        case "select":
          const optionRes = groupCell.response as ColumnResponse["select"];
          groupValues =
            "options" in optionRes ? optionRes.options : [optionRes.option];
          break;
        case "select-user":
          const userRes = groupCell.response as ColumnResponse["select-user"];
          groupValues = "users" in userRes ? userRes.users : [userRes.user];
          break;
        default:
          groupValues = [""];
          break;
      }

      groupValues.forEach((groupValue) => {
        if (!groups[groupValue]) {
          groups[groupValue] = [];
        }
        groups[groupValue].push({ cell, index });
      });
    });

    return Object.keys(groups).map((groupName) => ({
      groupName,
      rows: groups[groupName],
    }));
  }, [gridState]);

  if (!gridState) {
    return null;
  }

  const { columns, title, primaryColumn, primaryColumnType } = gridState;

  return (
    <Box
      sx={{
        flex: 1,
        p: 2,
        display: "flex",
        flexDirection: "column",
        width: "100%",
      }}
    >
      <GridHeader
        title={title}
        setShowNewColumnForm={setShowNewColumnForm}
        count={primaryColumn.length}
      />
      <Box
        sx={{
          display: "flex",
          flex: 1,
          overflow: "scroll",
          gap: 2,
        }}
      >
        <Panel sx={{ flex: 1, height: "100%", overflowX: "scroll" }}>
          <Box
            sx={{
              minWidth: "100%",
              display: "flex",
              flex: 1,
              flexDirection: "column",
            }}
          >
            <Box
              sx={{
                display: "flex",
                position: "sticky",
                top: 0,
                flexDirection: "row",
                borderBottom: "1px solid",
                borderColor: "border.default",
                background: "canvas.default",
                flex: 1,
                zIndex: 1,
              }}
            >
              <ColumnTitle title={capitalize(primaryColumnType)} />
              {columns.map((column: GridCol, index: number) => (
                <ColumnTitle key={index} title={column.title} index={index} />
              ))}
            </Box>
            {groupedRows.map((group, groupIndex) => (
              <Box key={groupIndex} sx={{ width: 'fit-content'}}>
                {group.groupName && (
                  <GroupHeader
                    groupName={group.groupName}
                    count={group.rows.length}
                  />
                )}
                {group.rows.map(({ cell, index }) => (
                  <Row
                    key={index}
                    rowIndex={index}
                    primaryCell={cell}
                    columns={columns}
                    selectRow={selectRow}
                    selectedIndex={selectedIndex}
                  />
                ))}
              </Box>
            ))}
          </Box>
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
            addNewColumn={({
              title,
              instructions,
              type,
              options,
              multiple,
            }) => {
              addNewColumn({ title, instructions, type, options, multiple });
              setShowNewColumnForm(false);
              return;
            }}
          />
        </Dialog>
      ) : null}
    </Box>
  );
}
