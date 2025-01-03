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
  const showMoveOptions = index !== undefined;
  const canMoveLeft = showMoveOptions && index! > 0;
  const canMoveRight = showMoveOptions && gridState && index! < gridState.columns.length - 1;
  const isGrouped = gridState?.groupBy !== undefined;

  return (
    <Box
      sx={{
        pr: 2,
        py: 1,
        pl: 3,
        flex: 1,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        ...(isGrouped ? {} : { zIndex: 2, position: 'sticky', top: 0 }),
        fontSize: 1,
        backgroundColor: 'white',
        color: 'fg.default',
        fontWeight: 'semibold',
        borderRight: '1px solid',
        borderColor: 'border.default',
        width: '260px',
        '&:last-child': {
          border: 0,
        },
      }}
    >
      <Box sx={{ color: 'fg.muted', fontSize: 0, fontWeight: 'bold', flex: 1 }}>{title}</Box>

      <ActionMenu>
        <ActionMenu.Anchor>
          <IconButton
            icon={KebabHorizontalIcon}
            aria-label="Column menu"
            size="small"
            variant="invisible"
          />
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
