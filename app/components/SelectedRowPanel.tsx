import { useState } from 'react';
import { IconButton, Box, Avatar, Text } from '@primer/react';
import { Dialog } from '@primer/react/experimental';
import DebugDialog from './DebugDialog';
import { XIcon, ChevronDownIcon, ChevronUpIcon } from '@primer/octicons-react';
import { GridCol, GridCell } from '../actions';
import { useGridContext } from './GridContext';
import { GridCellContent } from './Cell';
import SnippetDetails from './SelectedRowPanel/Snippet';
import IssueDetails, { Issue } from './SelectedRowPanel/IssueDetails';
import { Snippet } from '@/app/functions/semanticCodeSearch';

function ContextDetails({ primaryCell }: { primaryCell: GridCell }) {
  const [open] = useState<boolean>(true);
  const { context } = primaryCell;

  if (context.type === 'issue') {
    return <IssueDetails issue={context as Issue} />;
  }
  if (context.type === 'snippet') {
    return <SnippetDetails snippet={context as Snippet} />;
  }
  return (
    <Box
      sx={{
        flexShrink: 0,
        overflow: 'hidden',
      }}
    >
      <Box sx={{ fontSize: 1, fontWeight: 'semibold', pt: 3 }}>Original {context.type} details</Box>

      {open && (
        <Box sx={{ p: 3 }}>
          {Object.keys(context).map((key) => {
            const value = context[key];
            if (key === 'type' || key === 'value') return null;
            return (
              <Box sx={{ pb: 3, '&:last-child': { pb: 0 } }} key={key}>
                <Box sx={{ fontSize: 0, fontWeight: 'semibold', m: 0, pb: 0 }}>{key}</Box>

                <Box sx={{ fontSize: 0, color: 'fg.muted' }}>{value}</Box>
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
}

function CellValue({ column, cell }: { column: GridCol; cell: GridCell }) {
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
}

type HeaderProps = {
  next: () => void;
  previous: () => void;
  close: () => void;
  title: string;
};
function DialogHeader({ title, next, previous, close }: HeaderProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        p: 2,
        pl: 3,
        gap: 2,
        borderBottom: '1px solid',
        borderColor: 'border.default',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        left: 0,
        height: '48px',
      }}
    >
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

      <Box sx={{ display: 'flex', gap: 0, alignItems: 'center' }}>
        <IconButton
          aria-label="Previous"
          size="small"
          variant="invisible"
          icon={ChevronUpIcon}
          onClick={previous}
        />
        <IconButton
          aria-label="Next"
          size="small"
          variant="invisible"
          icon={ChevronDownIcon}
          onClick={next}
        />
        <Box sx={{ height: '16px', mx: 2, borderLeft: '1px solid', borderColor: 'border.muted' }} />
        <IconButton
          icon={XIcon}
          size="small"
          variant="invisible"
          aria-label="Close"
          onClick={close}
        />
      </Box>
    </Box>
  );
}

export default function SelectedRowPanel() {
  const { gridState, selectRow, selectedIndex } = useGridContext();
  if (!gridState) {
    return null;
  }
  if (selectedIndex === null) {
    return null;
  }

  const { columns } = gridState;

  const primaryColumn = gridState.primaryColumn;
  const primaryCell = primaryColumn[selectedIndex];

  function previousRow() {
    if (selectedIndex === null) {
      return null;
    }
    const targetRow = selectedIndex === 0 ? primaryColumn.length - 1 : selectedIndex - 1;
    selectRow(targetRow);
  }

  function nextRow() {
    if (selectedIndex === null) {
      return null;
    }
    const targetRow = selectedIndex === primaryColumn.length - 1 ? 0 : selectedIndex + 1;
    selectRow(targetRow);
  }

  return (
    <Dialog
      renderHeader={() => (
        <DialogHeader
          title={primaryCell.response as string}
          next={nextRow}
          previous={previousRow}
          close={() => selectRow(null)}
        />
      )}
      title={primaryCell.response as string}
      position="right"
      onClose={() => selectRow(null)}
    >
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
          <Box key={`cell-${i}`} sx={{ py: 3 }}>
            <CellValue column={c} cell={c.cells[selectedIndex]} />
          </Box>
        ))}
      </Box>
    </Dialog>
  );
}
