import React from 'react';
import { IconButton, Box, ActionMenu, ActionList } from '@primer/react';
import {
  KebabHorizontalIcon,
  PencilIcon,
  TrashIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@primer/octicons-react';
import { useGridContext } from './GridContext';

export default function ColumnTitle({ title, index }: { title: string; index?: number }) {
  const { deleteColumnByIndex, moveColumnLeft, moveColumnRight, gridState } = useGridContext();

  // Only show move options for non-primary columns
  const showMoveOptions = index !== undefined;
  // Disable move left for first column
  const canMoveLeft = showMoveOptions && index! > 0;
  // Disable move right for last column
  const canMoveRight = showMoveOptions && gridState && index! < gridState.columns.length - 1;

  return (
    <Box
      sx={{
        p: 2,
        pl: 3,
        flex: 1,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        zIndex: 2,
        position: 'sticky',
        top: 0,
        fontSize: 1,
        backgroundColor: 'white',
        color: 'fg.default',
        fontWeight: 'semibold',
        borderRight: '1px solid',
        borderColor: 'border.default',
        minWidth: '260px',
        '&:last-child': {
          border: 0,
        },
      }}
    >
      <Box sx={{ flex: 1 }}>{title}</Box>

      <ActionMenu>
        <ActionMenu.Anchor>
          <IconButton icon={KebabHorizontalIcon} aria-label="Column menu" variant="invisible" />
        </ActionMenu.Anchor>
        <ActionMenu.Overlay width="medium">
          <ActionList>
            {showMoveOptions && (
              <>
                <ActionList.Item
                  onSelect={() => canMoveLeft && moveColumnLeft(index!)}
                  disabled={!canMoveLeft}
                >
                  <ActionList.LeadingVisual>
                    <ChevronLeftIcon />
                  </ActionList.LeadingVisual>
                  Move left
                </ActionList.Item>
                <ActionList.Item
                  onSelect={() => canMoveRight && moveColumnRight(index!)}
                  disabled={!canMoveRight}
                >
                  <ActionList.LeadingVisual>
                    <ChevronRightIcon />
                  </ActionList.LeadingVisual>
                  Move right
                </ActionList.Item>
                <ActionList.Divider />
              </>
            )}
            {index !== undefined && (
              <ActionList.Item onSelect={() => deleteColumnByIndex(index)}>
                <ActionList.LeadingVisual>
                  <TrashIcon />
                </ActionList.LeadingVisual>
                Delete
              </ActionList.Item>
            )}
            <ActionList.Item onSelect={() => alert('Copy link clicked')}>
              <ActionList.LeadingVisual>
                <PencilIcon />
              </ActionList.LeadingVisual>
              Edit
            </ActionList.Item>
          </ActionList>
        </ActionMenu.Overlay>
      </ActionMenu>
    </Box>
  );
}
