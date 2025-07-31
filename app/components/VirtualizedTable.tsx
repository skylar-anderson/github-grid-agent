import React, { useState, useMemo, useCallback } from 'react';
import { Box } from '@primer/react';
import Row from './Row';
import type { GridCol, GridCell } from '../actions';

interface VirtualizedTableProps {
  rows: { cell: GridCell; index: number }[];
  columns: GridCol[];
  selectRow: (index: number) => void;
  selectedIndex: number | null;
  itemHeight?: number;
  containerHeight?: number;
  overscan?: number;
}

const VirtualizedTable = React.memo(function VirtualizedTable({
  rows,
  columns,
  selectRow,
  selectedIndex,
  itemHeight = 60,
  containerHeight = 600,
  overscan = 5,
}: VirtualizedTableProps) {
  const [scrollTop, setScrollTop] = useState(0);

  const totalHeight = rows.length * itemHeight;

  const visibleRange = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + overscan,
      rows.length
    );
    const startIndexWithOverscan = Math.max(0, startIndex - overscan);

    return {
      startIndex: startIndexWithOverscan,
      endIndex,
      offsetY: startIndexWithOverscan * itemHeight,
    };
  }, [scrollTop, itemHeight, containerHeight, overscan, rows.length]);

  const visibleRows = useMemo(() => {
    return rows.slice(visibleRange.startIndex, visibleRange.endIndex);
  }, [rows, visibleRange.startIndex, visibleRange.endIndex]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  // Only enable virtualization for large datasets
  const shouldVirtualize = rows.length > 100;

  if (!shouldVirtualize) {
    return (
      <Box>
        {rows.map(({ cell, index }) => (
          <Row
            key={`row-${index}`}
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

  return (
    <Box
      onScroll={handleScroll}
      sx={{
        height: containerHeight,
        overflowY: 'auto',
        overflowX: 'hidden',
      }}
    >
      <Box
        sx={{
          height: totalHeight,
          position: 'relative',
        }}
      >
        <Box
          sx={{
            transform: `translateY(${visibleRange.offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
          }}
        >
          {visibleRows.map(({ cell, index }) => (
            <Box
              key={`row-${index}`}
              sx={{
                height: itemHeight,
                display: 'flex',
                alignItems: 'stretch',
              }}
            >
              <Row
                rowIndex={index}
                primaryCell={cell}
                columns={columns}
                selectRow={selectRow}
                selectedIndex={selectedIndex}
              />
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
});

export default VirtualizedTable;