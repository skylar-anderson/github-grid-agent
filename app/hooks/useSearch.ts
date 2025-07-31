import { useMemo, useState, useCallback, useRef, useEffect } from 'react';
import { GridState } from '../actions';

export function useSearch(
  gridState: GridState | null,
  debounceMs: number = 300
) {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Debounce search term
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, debounceMs);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [searchTerm, debounceMs]);

  const handleSearchChange = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  const searchableData = useMemo(() => {
    if (!gridState) return [];
    
    return gridState.primaryColumn
      .map((cell, index) => ({ cell, index }))
      .filter(({ cell }) => !cell.deleted);
  }, [gridState]);

  const filteredData = useMemo(() => {
    if (!debouncedSearchTerm.trim() || !searchableData.length) {
      return searchableData;
    }

    const searchLower = debouncedSearchTerm.toLowerCase();
    
    return searchableData.filter(({ cell }) => {
      // Search in primary cell response
      const primaryResponse = typeof cell.response === 'string' 
        ? cell.response.toLowerCase()
        : JSON.stringify(cell.response).toLowerCase();
      
      if (primaryResponse.includes(searchLower)) {
        return true;
      }

      // Search in context
      const contextString = JSON.stringify(cell.context).toLowerCase();
      if (contextString.includes(searchLower)) {
        return true;
      }

      // Search in column cells if gridState is available
      if (gridState) {
        const rowIndex = cell.context.index || 0;
        for (const column of gridState.columns) {
          const columnCell = column.cells[rowIndex];
          if (columnCell) {
            const columnResponse = typeof columnCell.response === 'string'
              ? columnCell.response.toLowerCase()
              : JSON.stringify(columnCell.response).toLowerCase();
            
            if (columnResponse.includes(searchLower)) {
              return true;
            }
          }
        }
      }

      return false;
    });
  }, [debouncedSearchTerm, searchableData, gridState]);

  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
  }, []);

  return {
    searchTerm,
    filteredData,
    handleSearchChange,
    clearSearch,
    isSearching: debouncedSearchTerm.trim().length > 0,
    resultCount: filteredData.length,
  };
}