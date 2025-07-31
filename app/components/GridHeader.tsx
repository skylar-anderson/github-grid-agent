import React, { useCallback } from 'react';
import { TextInput, Text, ActionMenu, ActionList, Box, Button, CounterLabel } from '@primer/react';
import { ArrowLeftIcon, XIcon } from '@primer/octicons-react';
import { SearchIcon } from '@primer/octicons-react';
import { useGridContext } from './GridContext';
import { useSearch } from '../hooks/useSearch';
import NextLink from 'next/link';

const Search = React.memo(function Search() {
  const { gridState } = useGridContext();
  const { searchTerm, handleSearchChange, clearSearch, isSearching } = useSearch(gridState);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleSearchChange(e.target.value);
  }, [handleSearchChange]);

  return (
    <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      <TextInput
        leadingVisual={SearchIcon}
        placeholder="Search..."
        value={searchTerm}
        onChange={handleInputChange}
        sx={{ pr: isSearching ? '32px' : '12px' }}
      />
      {isSearching && (
        <Box
          as="button"
          onClick={clearSearch}
          sx={{
            position: 'absolute',
            right: '8px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            color: 'fg.muted',
            '&:hover': {
              color: 'fg.default',
              backgroundColor: 'canvas.inset',
            },
          }}
        >
          <XIcon size={12} />
        </Box>
      )}
    </Box>
  );
});

const GroupBy = React.memo(function GroupBy() {
  const { gridState, setGroupBy } = useGridContext();
  
  const handleGroupBySelect = useCallback((columnTitle: string) => {
    setGroupBy(columnTitle);
  }, [setGroupBy]);

  const handleClearGroupBy = useCallback(() => {
    setGroupBy(undefined);
  }, [setGroupBy]);

  if (!gridState) {
    return null;
  }
  
  const { groupBy } = gridState;
  const groupableColumnTypes = ['select', 'select-user'];
  const groupableColumns = gridState.columns.filter((column) =>
    groupableColumnTypes.includes(column.type)
  );
  
  if (gridState && groupableColumns.length === 0) {
    return null;
  }

  return (
    <ActionMenu>
      <ActionMenu.Button>
        {groupBy ? (
          <>
            <Text sx={{ color: 'fg.muted', fontWeight: 'semibold' }}>Group by:</Text>
            &nbsp;
            <Text>{groupBy}</Text>
          </>
        ) : (
          <Text>Group by</Text>
        )}
      </ActionMenu.Button>
      <ActionMenu.Overlay width="medium">
        <ActionList selectionVariant="single">
          {groupableColumns.map((column, index) => (
            <ActionList.Item
              selected={groupBy === column.title}
              key={`${column.title}-${index}`}
              onSelect={() => handleGroupBySelect(column.title)}
            >
              {column.title}
            </ActionList.Item>
          ))}
          {groupBy && (
            <ActionList.Item onSelect={handleClearGroupBy}>
              <Text sx={{ color: 'fg.muted', fontStyle: 'italic' }}>Clear grouping</Text>
            </ActionList.Item>
          )}
        </ActionList>
      </ActionMenu.Overlay>
    </ActionMenu>
  );
});

const FilterBy = React.memo(function FilterBy() {
  const { gridState, setFilterBy } = useGridContext();
  
  const handleFilterBySelect = useCallback((columnTitle: string, filterValue: string) => {
    setFilterBy(columnTitle, filterValue);
  }, [setFilterBy]);

  const handleClearFilter = useCallback(() => {
    setFilterBy(undefined, undefined);
  }, [setFilterBy]);

  if (!gridState) {
    return null;
  }
  
  const { filterByKey, filterByValue: _filterByValue } = gridState;
  const filterableColumnTypes = ['select', 'select-user', 'text'];
  const filterableColumns = gridState.columns.filter((column) =>
    filterableColumnTypes.includes(column.type)
  );
  
  if (gridState && filterableColumns.length === 0) {
    return null;
  }

  return (
    <ActionMenu>
      <ActionMenu.Button>
        {filterByKey ? (
          <>
            <Text sx={{ color: 'fg.muted', fontWeight: 'semibold' }}>Filter by:</Text>
            &nbsp;
            <Text>{filterByKey}</Text>
          </>
        ) : (
          <Text>Filter by</Text>
        )}
      </ActionMenu.Button>
      <ActionMenu.Overlay width="medium">
        <ActionList selectionVariant="single">
          {filterableColumns.map((column, index) => (
            <ActionList.Item
              selected={filterByKey === column.title}
              key={`${column.title}-${index}`}
              onSelect={() => handleFilterBySelect(column.title, '')}
            >
              {column.title}
            </ActionList.Item>
          ))}
          {filterByKey && (
            <ActionList.Item onSelect={handleClearFilter}>
              <Text sx={{ color: 'fg.muted', fontStyle: 'italic' }}>Clear filter</Text>
            </ActionList.Item>
          )}
        </ActionList>
      </ActionMenu.Overlay>
    </ActionMenu>
  );
});

export function GridHeader({
  title,
  setShowNewColumnForm,
  count,
}: {
  title: string;
  setShowNewColumnForm: (value: boolean) => void;
  count: number;
}) {
  const { saveGridAsGist, isSavingGist } = useGridContext();

  const handleSaveGist = useCallback(async () => {
    await saveGridAsGist();
  }, [saveGridAsGist]);

  const handleAddColumn = useCallback(() => {
    setShowNewColumnForm(true);
  }, [setShowNewColumnForm]);

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        p: 2,
        borderBottom: '1px solid',
        borderColor: 'border.default',
        backgroundColor: 'canvas.default',
        position: 'sticky',
        top: 0,
        zIndex: 1,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          flex: 1,
          gap: 2,
        }}
      >
        <NextLink href={`/`} passHref>
          <Box
            sx={{
              cursor: 'pointer',
              height: '28px',
              width: '28px',
              color: 'fg.muted',
              fontWeight: 'semibold',
              backgroundColor: 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 2,
              '&:hover': {
                backgroundColor: '#e0e0e0',
                color: 'fg.default',
                cursor: 'pointer',
              },
            }}
          >
            <ArrowLeftIcon />
          </Box>
        </NextLink>

        <Box>
          <Box
            sx={{
              display: 'inline-block',
              fontSize: 2,
              fontWeight: 'semibold',
              color: 'fg.default',
              mr: 1,
            }}
          >
            {title}
          </Box>
          <CounterLabel>{count}</CounterLabel>
        </Box>
      </Box>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Search />
        <GroupBy />
        <FilterBy />
        <Button onClick={handleSaveGist} disabled={isSavingGist}>
          Save to gist
        </Button>
        <Button variant="primary" onClick={handleAddColumn}>
          Add column
        </Button>
      </Box>
    </Box>
  );
}
