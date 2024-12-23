import { BaseColumnType } from '../columns/BaseColumnType';
import React from 'react';
import { Spinner, Box, IconButton, ActionMenu, ActionList } from '@primer/react';
import type { GridCell, ColumnType } from '../actions';
import { columnTypes } from '../columns';
import { useGridContext } from './GridContext';
import { KebabHorizontalIcon, TrashIcon } from '@primer/octicons-react';

type CellProps = {
  sx?: any;
  cell: GridCell;
  onClick?: () => void;
  isSelected?: boolean;
  rowIndex?: number;
};

export default function Cell({ sx, cell, onClick, isSelected = false, rowIndex }: CellProps) {
  const { deleteRow } = useGridContext();
  const isPrimaryCell = rowIndex !== undefined;

  const hoverProps = onClick
    ? {
        ':hover': {
          backgroundColor: 'canvas.inset',
          cursor: 'pointer',
          transition: 'background-color 300ms ease-in-out',
        },
      }
    : {};
  const selectedProps = {
    backgroundColor: 'canvas.inset',
  };

  return (
    <Box
      sx={{
        wordWrap: 'break-word',
        display: 'flex',
        flexShrink: 0,
        overflowY: 'scroll',
        flexDirection: 'column',
        position: 'relative',
        p: 3,
        fontSize: 1,
        flex: 1,
        boxSizing: 'border-box',
        minWidth: '260px',
        borderRight: '1px solid',
        borderColor: '#f0f0f0',
        overflow: 'hidden',
        '&:last-child': {
          border: 0,
        },
        ...(isSelected ? selectedProps : {}),
        ...hoverProps,
        ...sx,
      }}
      onClick={onClick}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ flex: 1 }}>
          <GridCellContent cell={cell} />
        </Box>

        {isPrimaryCell && (
          <ActionMenu>
            <ActionMenu.Anchor>
              <IconButton
                variant="invisible"
                aria-labelledby="Row menu"
                icon={KebabHorizontalIcon}
              />
            </ActionMenu.Anchor>
            <ActionMenu.Overlay width="medium">
              <ActionList>
                <ActionList.Item onSelect={() => deleteRow(rowIndex)}>
                  <ActionList.LeadingVisual>
                    <TrashIcon />
                  </ActionList.LeadingVisual>
                  Delete row
                </ActionList.Item>
              </ActionList>
            </ActionMenu.Overlay>
          </ActionMenu>
        )}
      </Box>
    </Box>
  );
}

export function GridCellContent({ cell }: { cell: GridCell }) {
  if (cell.state === 'error') {
    return cell.errorMessage;
  }
  if (cell.state === 'empty') {
    return <Spinner size="small" />;
  }

  const columnType = columnTypes[cell.columnType] as BaseColumnType<ColumnType>;
  return columnType.renderCell(cell);
}
