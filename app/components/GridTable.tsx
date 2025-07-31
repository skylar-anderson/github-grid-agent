'use client';
import { useMemo, useCallback, useState } from 'react';
import type { GridCol, GridCell, ColumnResponse } from '../actions';
import { Dialog } from '@primer/react/experimental';
import { Text, Box, CounterLabel } from '@primer/react';
import { GridHeader } from './GridHeader';
import { useGridContext } from './GridContext';
import SelectedContext from './SelectedRowPanel';
import NewColumnForm from './NewColumnForm';
import './Grid.css';
import ColumnTitle from './ColumnTitle';
import { pluralize } from '../utils/pluralize';
import { capitalize } from '../utils/capitalize';
import type { GridState, PrimaryDataType } from '../actions';
import React from 'react';
import VirtualizedTable from './VirtualizedTable';

const Panel = React.memo(function Panel({ children, sx = {} }: { children: React.ReactNode; sx?: any }) {
  return (
    <Box
      sx={{
        flex: 1,
        backgroundColor: 'white',
        borderRadius: 2,
        border: '1px solid',
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        borderColor: 'border.default',
        overflow: 'scroll',
        ...sx,
      }}
    >
      {children}
    </Box>
  );
});

const GroupHeader = React.memo(function GroupHeader({ groupName, count }: { groupName: string; count: number }) {
  return (
    <Box
      sx={{
        backgroundColor: 'canvas.subtle',
        fontSize: 1,
        p: 2,
        px: 3,
        color: 'fg.muted',
        fontWeight: 'bold',
        borderBottom: '1px solid',
        flex: 2,
        position: 'sticky',
        top: '49px',
        zIndex: 1,
        borderColor: 'border.default',
      }}
    >
      <Text sx={{ mr: 2 }}>{count === 1 ? groupName : pluralize(groupName)}</Text>
      <CounterLabel>{count}</CounterLabel>
    </Box>
  );
});

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
    
    // Filter out deleted rows early
    const visiblePrimaryRows = primaryColumn
      .map((cell, index) => ({ cell, index }))
      .filter(({ cell }) => !cell.deleted);

    const defaultGroup = {
      groupName: '',
      rows: visiblePrimaryRows,
    };

    if (!groupBy) {
      return [defaultGroup];
    }

    const groupColumn = columns.find((col) => col.title === groupBy);
    if (!groupColumn) {
      return [defaultGroup];
    }

    const groups: { [key: string]: { cell: GridCell; index: number }[] } = {};

    visiblePrimaryRows.forEach(({ cell, index }) => {
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

const TableHeaderRow = React.memo(function TableHeaderRow({
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
        position: 'sticky',
        top: 0,
        flexDirection: 'row',
        borderBottom: '1px solid',
        borderColor: 'border.default',
        background: 'canvas.default',
        flex: 1,
        zIndex: 1,
      }}
    >
      <ColumnTitle title={capitalize(primaryColumnType)} />
      {columns.map((column: GridCol, index: number) => (
        <ColumnTitle key={`${column.title}-${index}`} title={column.title} index={index} />
      ))}
    </Box>
  );
});

const TableContent = React.memo(function TableContent() {
  const { gridState, selectRow, selectedIndex } = useGridContext();
  const groupedRows = useGroupedRows(gridState);
  
  if (!gridState) return null;

  const { columns } = gridState;

  // If we have groups, render them separately
  if (groupedRows.length > 1 || (groupedRows.length === 1 && groupedRows[0].groupName)) {
    return (
      <Box>
        {groupedRows.map((group, groupIndex) => (
          <Box key={`group-${groupIndex}-${group.groupName}`}>
            {group.groupName && (
              <GroupHeader groupName={group.groupName} count={group.rows.length} />
            )}
            <VirtualizedTable
              rows={group.rows}
              columns={columns}
              selectRow={selectRow}
              selectedIndex={selectedIndex}
              containerHeight={400}
            />
          </Box>
        ))}
      </Box>
    );
  }

  // For simple case without grouping, use virtualization directly
  const allRows = groupedRows[0]?.rows || [];
  
  return (
    <VirtualizedTable
      rows={allRows}
      columns={columns}
      selectRow={selectRow}
      selectedIndex={selectedIndex}
      containerHeight={600}
    />
  );
});

export default function GridTable() {
  const { showNewColumnForm, setShowNewColumnForm, onDialogClose } = useColumnDialog();
  const { gridState, addNewColumn, selectedIndex } = useGridContext();
  
  if (!gridState) {
    return null;
  }

  const { columns, title, primaryColumn, primaryColumnType } = gridState;

  return (
    <Box
      sx={{
        flex: 1,
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
      }}
    >
      <GridHeader
        title={title}
        setShowNewColumnForm={setShowNewColumnForm}
        count={primaryColumn.filter(cell => !cell.deleted).length}
      />
      <Box
        sx={{
          display: 'flex',
          flex: 1,
          overflow: 'hidden',
          gap: 2,
        }}
      >
        <Panel sx={{ flex: 1, height: '100%', overflow: 'hidden' }}>
          <Box
            sx={{
              minWidth: '100%',
              display: 'flex',
              flex: 1,
              flexDirection: 'column',
              height: '100%',
            }}
          >
            <TableHeaderRow primaryColumnType={primaryColumnType} columns={columns} />
            <Box sx={{ flex: 1, overflow: 'hidden' }}>
              <TableContent />
            </Box>
          </Box>
        </Panel>

        {selectedIndex !== null && (
          <Panel sx={{ flex: 0, minWidth: '640px', height: '100%' }}>
            <SelectedContext />
          </Panel>
        )}
      </Box>

      {showNewColumnForm ? (
        <Dialog title="Add new column" position="right" onClose={onDialogClose}>
          <NewColumnForm
            addNewColumn={({ title, instructions, type, options, multiple }) => {
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
