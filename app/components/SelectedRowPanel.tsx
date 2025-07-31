import React, { useState, useMemo, useCallback } from 'react';
import { IconButton, Box, Avatar, Text } from '@primer/react';
import DebugDialog from './DebugDialog';
import { XIcon, ChevronDownIcon, ChevronUpIcon } from '@primer/octicons-react';
import { GridCol, GridCell } from '../actions';
import { useGridContext } from './GridContext';
import './SelectedContext.css';
import { GridCellContent } from './Cell';
import { marked } from 'marked';

const avatarUrl = (handle: string, size: number = 200) =>
  `https://github.com/${handle}.png?size=${size}`;
/*
assignee_handle
siddharthkp
assignee_avatar
https://avatars.githubusercontent.com/u/1863771?v=4
assignee_url
https://github.com/siddharthkp
opener_handle
DavidMeu
state
open
title
[ActionMenu.Button] onClick doesn't function
body
### Description When trying to pass a function to `ActionMenu.Button ` it doesn't get invoked. ![Image](https://github.com/primer/react/assets/35102691/c6d77c3e-64b5-43c1-9d78-c3e28fa235ef) ### Steps to reproduce 1. Goto: https://primer.style/react/ActionMenu 2. Overload `onClick` and see it doesn't get invoked on clicking. ### Version ^36.19.1 ### Browser _No response_
number
4647
url
https://github.com/primer/react/issues/4647*/

type Issue = {
  assignee_handle: string;
  assignee_avatar: string;
  assignee_url: string;
  opener_handle: string;
  state: string;
  title: string;
  body: string;
  number: string;
  url: string;
};

const IssueDetails = React.memo(function IssueDetails({ issue }: { issue: Issue }) {
  const [open, setOpen] = useState<boolean>(false);

  const handleToggleOpen = useCallback(() => setOpen(prev => !prev), []);

  const parsedMarkdown = useMemo(() => {
    try {
      return marked.parse(issue.body);
    } catch {
      return issue.body;
    }
  }, [issue.body]);

  const formattedDate = useMemo(() => {
    try {
      return new Date(issue.url).toLocaleDateString();
    } catch {
      return 'Unknown date';
    }
  }, [issue.url]);

  return (
    <Box sx={{ p: 3 }}>
      <Box
        as="a"
        href={issue.url}
        sx={{
          display: 'block',
          color: 'fg.default',
          textDecoration: 'none',
          fontSize: 4,
          fontWeight: 'semibold',
          lineHeight: 1.33,
          mb: 3,
        }}
      >
        {issue.title}
        <Text sx={{ color: 'fg.muted' }}>(#{issue.number})</Text>
      </Box>
      <Box
        sx={{
          fontSize: 0,
          border: '1px solid',
          borderColor: 'border.default',
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            px: 3,
            py: 2,
            backgroundColor: 'canvas.inset',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            borderBottom: '1px solid',
            borderColor: 'border.default',
          }}
        >
          <Avatar src={avatarUrl(issue.opener_handle)} size={20} sx={{ mr: 1 }} />
          <Text sx={{ color: 'fg.default', fontWeight: 'semibold' }}>
            {issue.opener_handle}
          </Text>{' '}
          <Text sx={{ color: 'fg.muted' }}>
            opened this issue on {formattedDate}
          </Text>
        </Box>
        <Box
          sx={{
            p: 3,
            maxHeight: open ? 'none' : '225px',
            overflow: 'hidden',
            position: 'relative',
            transition: 'max-height 0.3s ease',
          }}
        >
          <div
            className="markdownContainer"
            dangerouslySetInnerHTML={{ __html: parsedMarkdown }}
          />
          <IconButton
            icon={open ? ChevronUpIcon : ChevronDownIcon}
            aria-label={open ? "Show less" : "Show more"}
            onClick={handleToggleOpen}
            sx={{
              position: 'absolute',
              bottom: 2,
              right: 2,
              backgroundColor: 'canvas.default',
            }}
          />
        </Box>
      </Box>
    </Box>
  );
});

const ContextDetails = React.memo(function ContextDetails({ primaryCell }: { primaryCell: GridCell }) {
  const [open] = useState<boolean>(true);
  const { context } = primaryCell;

  const contextEntries = useMemo(() => {
    return Object.entries(context).filter(([key]) => key !== 'type' && key !== 'value');
  }, [context]);

  if (context.type === 'issue') {
    return <IssueDetails issue={context as Issue} />;
  }

  return (
    <Box
      sx={{
        flexShrink: 0,
        overflow: 'hidden',
      }}
    >
      <Box sx={{ fontSize: 1, fontWeight: 'semibold', px: 3, pt: 3 }}>
        Original {context.type} details
      </Box>

      {open && (
        <Box sx={{ p: 3 }}>
          {contextEntries.map(([key, value]) => (
            <Box sx={{ pb: 3, '&:last-child': { pb: 0 } }} key={key}>
              <Box sx={{ fontSize: 0, fontWeight: 'semibold', m: 0, pb: 0 }}>{key}</Box>
              <Box sx={{ fontSize: 0, color: 'fg.muted' }}>{value}</Box>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
});

const CellValue = React.memo(function CellValue({ column, cell }: { column: GridCol; cell: GridCell }) {
  const sources = cell.hydrationSources;
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
      }}
    >
      <Box sx={{ fontSize: 1, fontWeight: 'semibold' }}>
        {column.title} <DebugDialog prompt={cell.prompt || ''} sources={sources} />
      </Box>

      <Box sx={{ flexDirection: 'column', display: 'flex', flex: 1, gap: 1 }}>
        <GridCellContent cell={cell} />
      </Box>
    </Box>
  );
});

type HeaderProps = {
  next: () => void;
  previous: () => void;
  close: () => void;
  title: string;
};

const ContextHeader = React.memo(function ContextHeader({ next, previous, close, title }: HeaderProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        px: 3,
        py: 2,
        borderBottom: '1px solid',
        borderColor: 'border.default',
        backgroundColor: 'canvas.subtle',
      }}
    >
      <Box
        as="button"
        onClick={previous}
        sx={{
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 1,
          p: 1,
          borderRadius: 1,
          '&:hover': {
            backgroundColor: 'canvas.inset',
          },
        }}
        aria-label="Previous"
      >
        ←
      </Box>
      <Box
        as="button"
        onClick={next}
        sx={{
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 1,
          p: 1,
          borderRadius: 1,
          '&:hover': {
            backgroundColor: 'canvas.inset',
          },
        }}
        aria-label="Next"
      >
        →
      </Box>

      <Box
        sx={{
          flex: 1,
          fontSize: 1,
          fontWeight: 'semibold',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {title}
      </Box>

      <IconButton
        icon={XIcon}
        size="small"
        variant="invisible"
        aria-label="Close"
        onClick={close}
      />
    </Box>
  );
});

export default function SelectedRowPanel() {
  const { gridState, selectRow, selectedIndex } = useGridContext();
  
  const previousRow = useCallback(() => {
    if (selectedIndex === null || !gridState) return;
    const targetRow = selectedIndex === 0 ? gridState.primaryColumn.length - 1 : selectedIndex - 1;
    selectRow(targetRow);
  }, [selectedIndex, gridState, selectRow]);

  const nextRow = useCallback(() => {
    if (selectedIndex === null || !gridState) return;
    const targetRow = selectedIndex === gridState.primaryColumn.length - 1 ? 0 : selectedIndex + 1;
    selectRow(targetRow);
  }, [selectedIndex, gridState, selectRow]);

  const closePanel = useCallback(() => {
    selectRow(null);
  }, [selectRow]);

  if (!gridState || selectedIndex === null) {
    return null;
  }

  const { columns, primaryColumn } = gridState;
  const primaryCell = primaryColumn[selectedIndex];

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <ContextHeader
        title={primaryCell.response as string}
        next={nextRow}
        previous={previousRow}
        close={closePanel}
      />

      <Box
        sx={{
          flex: 1,
          height: '100%',
          overflow: 'scroll',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <ContextDetails primaryCell={primaryCell} />

        {columns.map((c, i) => (
          <Box key={`cell-${c.title}-${i}`} sx={{ p: 3 }}>
            <CellValue column={c} cell={c.cells[selectedIndex]} />
          </Box>
        ))}
      </Box>
    </Box>
  );
}
