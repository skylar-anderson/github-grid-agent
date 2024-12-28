import {
  IconButton,
  TextInput,
  Text,
  ActionMenu,
  ActionList,
  Box,
  Button,
  CounterLabel,
} from '@primer/react';
import {
  SidebarCollapseIcon,
  SidebarExpandIcon,
  ArrowLeftIcon,
  SearchIcon,
  KebabHorizontalIcon,
} from '@primer/octicons-react';
import { useGridContext } from './GridContext';
import NextLink from 'next/link';

export function Search() {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <TextInput
        leadingVisual={SearchIcon}
        sx={{ flexGrow: 0 }}
        /*trailingAction={<IconButton variant="invisible" aria-labelledby="Clear search" icon={XCircleFillIcon} />}*/
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
              key={index}
              onSelect={() => setGroupBy(column.title)}
            >
              {column.title}
            </ActionList.Item>
          ))}
          <ActionList.Item selected={groupBy === undefined} onSelect={() => setGroupBy(undefined)}>
            Ungrouped
          </ActionList.Item>
        </ActionList>
      </ActionMenu.Overlay>
    </ActionMenu>
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
      <ActionMenu.Button>Filter</ActionMenu.Button>
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
  count: number;
  setShowNewColumnForm: (b: boolean) => void;
};
export function GridHeader({ title, setShowNewColumnForm, count }: GridHeaderProps) {
  const { saveGridAsGist, isSavingGist, setShowChat, showChat } = useGridContext();

  const handleSaveGist = async () => {
    const gistUrl = await saveGridAsGist();
    if (gistUrl) {
      window.open(gistUrl, '_blank');
    }
  };

  return (
    <Box
      sx={{
        pb: 2,
        pl: 2,
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
        <Box sx={{ display: ['none', 'none', 'flex'], gap: 2 }}>
          <Search />
          <GroupBy />
          <FilterBy />
          <Button onClick={handleSaveGist} disabled={isSavingGist}>
            Save to gist
          </Button>
          <Button onClick={() => setShowNewColumnForm(true)}>Add column</Button>
          <IconButton
            sx={{ flexShrink: 0 }}
            aria-labelledby="Toggle chat"
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
