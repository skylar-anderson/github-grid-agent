import { IconButton, TextInput, ActionMenu, ActionList, Box } from '@primer/react';
import {
  ThreeBarsIcon,
  RowsIcon,
  FilterIcon,
  SearchIcon,
  ShareIcon,
  KebabHorizontalIcon,
  PlusIcon,
  SidebarCollapseIcon,
  SidebarExpandIcon,
} from '@primer/octicons-react';
import { useGridContext } from './GridContext';
import NextLink from 'next/link';

export function Search() {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <TextInput
        leadingVisual={SearchIcon}
        sx={{ flexGrow: 0, backgroundColor: 'canvas.inset' }}
        placeholder="Search..."
      />
    </Box>
  );
}

export function GroupBy() {
  const { gridState, setGroupBy } = useGridContext();
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
      <ActionMenu.Anchor>
        <IconButton aria-labelledby="Group by" icon={RowsIcon} />
      </ActionMenu.Anchor>
      <ActionMenu.Overlay width="medium">
        <ActionList selectionVariant="single">
          <Box
            as="h3"
            sx={{
              m: 0,
              p: 2,
              px: 3,
              fontSize: 0,
              fontWeight: 'bold',
              color: 'fg.muted',
            }}
          >
            Group rows by
          </Box>
          {groupableColumns.map((column, index) => (
            <ActionList.Item
              selected={groupBy === column.title}
              key={index}
              onSelect={() => setGroupBy(column.title)}
            >
              {column.title}
            </ActionList.Item>
          ))}
          <ActionList.Divider />
          <ActionList.Item selected={groupBy === undefined} onSelect={() => setGroupBy(undefined)}>
            Don&apos;t group rows
          </ActionList.Item>
        </ActionList>
      </ActionMenu.Overlay>
    </ActionMenu>
  );
}

function Divider() {
  return (
    <Box sx={{ height: '16px', mx: 2, borderLeft: '1px solid', borderColor: 'border.muted' }} />
  );
}

export function FilterBy() {
  const { gridState } = useGridContext();
  if (!gridState) {
    return null;
  }

  const filterableColumnTypes = ['select', 'select-user'];
  const filterableColumns = gridState.columns.filter((column) =>
    filterableColumnTypes.includes(column.type)
  );
  if (gridState && filterableColumns.length === 0) {
    return null;
  }
  return (
    <ActionMenu>
      <ActionMenu.Anchor>
        <IconButton aria-labelledby="Filter" icon={FilterIcon} />
      </ActionMenu.Anchor>
      <ActionMenu.Overlay width="medium">
        <ActionList>
          {filterableColumns.map((column, index) => (
            <ActionList.Item key={index} onSelect={() => alert(`Group by ${column.title}`)}>
              {column.title}
            </ActionList.Item>
          ))}
        </ActionList>
      </ActionMenu.Overlay>
    </ActionMenu>
  );
}

type GridHeaderProps = {
  title: string;
  subtitle: string;
  setShowNewColumnForm: (b: boolean) => void;
};
export function GridHeader({ title, setShowNewColumnForm, subtitle }: GridHeaderProps) {
  const { saveGridAsGist, isSavingGist, showChat, setShowChat } = useGridContext();

  const handleSaveGist = async () => {
    const gistUrl = await saveGridAsGist();
    if (gistUrl) {
      window.open(gistUrl, '_blank');
    }
  };

  return (
    <Box
      sx={{
        py: 3,
        px: 3,
        display: 'flex',
        flexDirection: 'row',
        gap: 2,
        justifyContent: 'center',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          flex: 1,
          gap: 3,
        }}
      >
        <NextLink href={`/`} passHref>
          <IconButton icon={ThreeBarsIcon} aria-label="Back to home" />
        </NextLink>

        <Box sx={{ display: 'flex', alignItems: 'baseline', flexDirection: 'row' }}>
          <Box
            sx={{
              display: 'inline-block',
              fontSize: 2,
              fontWeight: 'semibold',
              color: 'fg.default',
              mr: 2,
            }}
          >
            {title}
          </Box>
          <Box sx={{ color: 'fg.muted', fontSize: 1 }}>{subtitle}</Box>
        </Box>
      </Box>
      <Box sx={{ display: 'flex', gap: 0 }}>
        <Box sx={{ display: ['none', 'none', 'flex'], gap: 2, alignItems: 'center' }}>
          <Search />
          <GroupBy />
          <FilterBy />
          <Divider />
          <IconButton
            aria-label="Save to gist"
            onClick={handleSaveGist}
            icon={ShareIcon}
            disabled={isSavingGist}
          />

          <IconButton
            aria-labelledby="Add column"
            icon={PlusIcon}
            onClick={() => setShowNewColumnForm(true)}
          />

          <Divider />

          <IconButton
            aria-labelledby="Chat"
            icon={showChat ? SidebarCollapseIcon : SidebarExpandIcon}
            onClick={() => setShowChat(!showChat)}
          />
        </Box>

        <Box sx={{ display: ['flex', 'flex', 'none'] }}>
          <ActionMenu>
            <ActionMenu.Button variant="invisible" aria-label="More actions">
              <KebabHorizontalIcon />
            </ActionMenu.Button>
            <ActionMenu.Overlay>
              <ActionList>
                <ActionList.Item onSelect={handleSaveGist}>Save to gist</ActionList.Item>
                <ActionList.Item onSelect={() => setShowNewColumnForm(true)}>
                  Add column
                </ActionList.Item>
                <ActionList.Item onSelect={() => setShowChat(!showChat)}>
                  {showChat ? 'Hide chat' : 'Show chat'}
                </ActionList.Item>
              </ActionList>
            </ActionMenu.Overlay>
          </ActionMenu>
        </Box>
      </Box>
    </Box>
  );
}
