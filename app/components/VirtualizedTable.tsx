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

  const totalHeight = useMemo(() => rows.length * itemHeight, [rows.length, itemHeight]);

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
    // Use requestAnimationFrame for smoother scrolling
    requestAnimationFrame(() => {
      setScrollTop(e.currentTarget.scrollTop);
    });
  }, []);

  // Only enable virtualization for large datasets
  const shouldVirtualize = rows.length > 100;

  if (!shouldVirtualize) {
    return (
      <Box className="grid-table">
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
      className="virtualized-table scroll-container"
      onScroll={handleScroll}
      sx={{
        height: containerHeight,
        overflowY: 'auto',
        overflowX: 'hidden',
        contain: 'strict',
        willChange: 'scroll-position',
      }}
    >
      <Box
        sx={{
          height: totalHeight,
          position: 'relative',
          contain: 'layout',
        }}
      >
        <Box
          sx={{
            transform: `translate3d(0, ${visibleRange.offsetY}px, 0)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            willChange: 'transform',
          }}
        >
          {visibleRows.map(({ cell, index }) => (
            <Box
              key={`row-${index}`}
              className="grid-row"
              sx={{
                height: itemHeight,
                display: 'flex',
                alignItems: 'stretch',
                contain: 'layout style',
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