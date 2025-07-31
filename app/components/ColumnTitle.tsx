import React, { useCallback } from 'react';
import { Box, Text, IconButton, ActionMenu, ActionList } from '@primer/react';
import { KebabHorizontalIcon, TrashIcon } from '@primer/octicons-react';
import { useGridContext } from './GridContext';

type ColumnTitleProps = {
  title: string;
  index?: number;
};

function ColumnTitle({ title, index }: ColumnTitleProps) {
  const { deleteColumnByIndex, setGroupBy, setFilterBy } = useGridContext();
  const hasIndex = index !== undefined;

  const handleDeleteColumn = useCallback(() => {
    if (index !== undefined) {
      deleteColumnByIndex(index);
    }
  }, [deleteColumnByIndex, index]);

  const handleGroupBy = useCallback(() => {
    setGroupBy(title);
  }, [setGroupBy, title]);

  const handleClearFilters = useCallback(() => {
    setFilterBy(undefined, undefined);
  }, [setFilterBy]);

  return (
    <Box
      sx={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        p: 3,
        fontSize: 1,
        flex: 1,
        boxSizing: 'border-box',
        minWidth: '260px',
        borderRight: '1px solid',
        borderColor: '#f0f0f0',
        fontWeight: 'bold',
        '&:last-child': {
          border: 0,
        },
      }}
    >
      <Text>{title}</Text>
      {hasIndex && (
        <ActionMenu>
          <ActionMenu.Anchor>
            <IconButton variant="invisible" aria-labelledby="Column menu" icon={KebabHorizontalIcon} />
          </ActionMenu.Anchor>
          <ActionMenu.Overlay width="medium">
            <ActionList>
              <ActionList.Item onSelect={handleGroupBy}>Group by {title}</ActionList.Item>
              <ActionList.Item onSelect={handleClearFilters}>Clear filters</ActionList.Item>
              <ActionList.Divider />
              <ActionList.Item variant="danger" onSelect={handleDeleteColumn}>
                <ActionList.LeadingVisual>
                  <TrashIcon />
                </ActionList.LeadingVisual>
                Delete column
              </ActionList.Item>
            </ActionList>
          </ActionMenu.Overlay>
        </ActionMenu>
      )}
    </Box>
  );
}

export default React.memo(ColumnTitle);
