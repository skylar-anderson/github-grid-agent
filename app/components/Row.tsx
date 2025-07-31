import { Box } from '@primer/react';
import Cell from './Cell';
import type { GridCol, GridCell } from '../actions';
import React from 'react';

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
        display: 'flex',
        flexDirection: 'row',
        borderBottom: '1px solid',
        borderColor: '#f0f0f0',
        transition: 'background-color 300ms ease-in-out',
        '&:hover': {
          backgroundColor: 'canvas.inset',
          borderColor: 'border.default',
          cursor: 'pointer',
        },
      }}
      onClick={() => selectRow(rowIndex)}
    >
      <Cell cell={primaryCell} isSelected={selectedIndex === rowIndex} rowIndex={rowIndex} />
      {columns.map((column) => (
        <Cell
          key={`${column.title}-${rowIndex}`}
          cell={column.cells[rowIndex]}
          isSelected={selectedIndex === rowIndex}
        />
      ))}
    </Box>
  );
}

// Memoize Row component to prevent unnecessary re-renders
export default React.memo(Row);
