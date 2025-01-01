'use client';
import { useMemo, useCallback, useState } from 'react';
import type { GridCol, GridCell, ColumnResponse } from '../actions';
import { Text, Box, CounterLabel } from '@primer/react';
import { GridHeader } from './GridHeader';
import { useGridContext } from './GridContext';
import SelectedRowPanel from './SelectedRowPanel';
import NewColumnForm from './NewColumnForm';
import './Grid.css';
import ColumnTitle from './ColumnTitle';
import { pluralize } from '../utils/pluralize';
import { capitalize } from '../utils/capitalize';
import type { GridState, PrimaryDataType } from '../actions';
import Row from './Row';
import GridChat from './GridChat';

function GroupHeader({ groupName, count }: { groupName: string; count: number }) {
  return (
    <Box
      sx={{
        fontSize: 1,
        p: 3,
        color: 'fg.default',
        fontWeight: 'bold',
        borderBottom: '1px solid',
        flex: 1,
        borderColor: 'border.default',
        //position: 'sticky',
        //top: '49px',
        //zIndex: 1,
      }}
    >
      <Text sx={{ mr: 2 }}>{count === 1 ? groupName : pluralize(groupName)}</Text>
      <CounterLabel>{count}</CounterLabel>
    </Box>
  );
}

function useColumnDialog() {
  const [showNewColumnForm, setShowNewColumnForm] = useState<boolean | null>();
  const onDialogClose = useCallback(() => setShowNewColumnForm(false), []);

  return {
    showNewColumnForm,
    setShowNewColumnForm,
    onDialogClose,
  };
}

function useGroupedRows(gridState: GridState | null) {
  return useMemo(() => {
    if (!gridState) {
      return [];
    }

    const { columns, primaryColumn, groupBy } = gridState;
    const defaultGroup = {
      groupName: '',
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
      let optionRes;
      let userRes;

      switch (groupColumn.type) {
        case 'select':
          optionRes = groupCell.response as ColumnResponse['select'];
          groupValues = 'options' in optionRes ? optionRes.options : [optionRes.option];
          break;
        case 'select-user':
          userRes = groupCell.response as ColumnResponse['select-user'];
          groupValues = 'users' in userRes ? userRes.users : [userRes.user];
          break;
        default:
          groupValues = [''];
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
}

function TableHeaderRow({
  columns,
  primaryColumnType,
}: {
  columns: GridCol[];
  primaryColumnType: PrimaryDataType;
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        borderBottom: '1px solid',
        borderColor: 'border.default',
        background: 'canvas.default',
        flex: 1,
      }}
    >
      <ColumnTitle title={capitalize(primaryColumnType)} />
      {columns.map((column: GridCol, index: number) => (
        <ColumnTitle key={index} title={column.title} index={index} />
      ))}
    </Box>
  );
}

function RowsContent({ rows }: { rows: { cell: GridCell; index: number }[] }) {
  const { gridState, selectRow, selectedIndex } = useGridContext();
  if (!gridState) return null;

  const { columns } = gridState;

  return (
    <Box>
      {rows.map(({ cell, index }) => (
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
  );
}

export default function GridTable() {
  const { showNewColumnForm, setShowNewColumnForm, onDialogClose } = useColumnDialog();
  const { gridState, addNewColumn, selectedIndex } = useGridContext();

  const groupedRows = useGroupedRows(gridState);
  if (!gridState) {
    return null;
  }

  const { columns, title, primaryColumn, primaryColumnType, groupBy } = gridState;
  const subtitle = `${primaryColumn.length} ${primaryColumnType}${primaryColumn.length === 1 ? '' : 's'}`;
  return (
    <Box
      sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
      }}
    >
      <GridHeader title={title} subtitle={subtitle} setShowNewColumnForm={setShowNewColumnForm} />
      <Box
        sx={{
          display: 'flex',
          flex: 1,
          overflow: 'scroll',
        }}
      >
        <Box
          sx={{
            //borderTop: '1px solid',
            borderColor: 'border.default',
            backgroundColor: 'canvas.default',
            flex: 1,
            height: '100%',
            overflowX: 'scroll',
          }}
        >
          <Box
            sx={{
              minWidth: '100%',
              display: 'flex',
              flex: 1,
              flexDirection: 'column',
              p: 3,
              pt: 0,
              backgroundColor: 'canvas.inset',
              gap: 3,
            }}
          >
            {groupedRows.map((group, groupIndex) => (
              <Box
                key={groupIndex}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  border: '1px solid',
                  borderColor: 'border.default',
                  borderRadius: 2,
                  backgroundColor: 'canvas.default',
                  overflow: 'hidden',
                }}
              >
                {group.groupName && (
                  <GroupHeader
                    groupName={`${groupBy} is ${group.groupName}`}
                    count={group.rows.length}
                  />
                )}
                <TableHeaderRow primaryColumnType={primaryColumnType} columns={columns} />
                <RowsContent rows={group.rows} />
              </Box>
            ))}

            <GridChat />
          </Box>
        </Box>

        {selectedIndex !== null && <SelectedRowPanel />}
      </Box>

      {showNewColumnForm ? (
        <NewColumnForm
          onDialogClose={onDialogClose}
          addNewColumn={({ title, instructions, type, options, multiple }) => {
            addNewColumn({ title, instructions, type, options, multiple });
            setShowNewColumnForm(false);
            return;
          }}
        />
      ) : null}
    </Box>
  );
}
