import {
  TextInput,
  Text,
  ActionMenu,
  ActionList,
  Box,
  Button,
  CounterLabel,
  IconButton,
  Tooltip,
} from "@primer/react";
import { ArrowLeftIcon } from "@primer/octicons-react";
import { SearchIcon } from "@primer/octicons-react";
import { useGridContext } from "./GridContext";
import NextLink from "next/link";

export function Search() {
  return (
    <TextInput
      leadingVisual={SearchIcon}
      /*trailingAction={<IconButton variant="invisible" aria-labelledby="Clear search" icon={XCircleFillIcon} />}*/
      placeholder="Search..."
    />
  );
}

export function GroupBy() {
  const { gridState, setGroupBy } = useGridContext();
  if (!gridState) {
    return null;
  }
  const { groupBy } = gridState;
  const groupableColumnTypes = ["select", "select-user"];
  const groupableColumns = gridState.columns.filter((column) =>
    groupableColumnTypes.includes(column.type),
  );
  if (gridState && groupableColumns.length === 0) {
    return null;
  }

  return (
    <ActionMenu>
      <ActionMenu.Button>
        {groupBy ? (
          <>
            <Text sx={{ color: "fg.muted", fontWeight: "semibold" }}>
              Group by:
            </Text>
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
          <ActionList.Item
            selected={groupBy === undefined}
            onSelect={() => setGroupBy(undefined)}
          >
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

  const filterableColumnTypes = ["select", "select-user"];
  const filterableColumns = gridState.columns.filter((column) =>
    filterableColumnTypes.includes(column.type),
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
            <ActionList.Item
              key={index}
              onSelect={() => alert(`Group by ${column.title}`)}
            >
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
export function GridHeader({
  title,
  setShowNewColumnForm,
  count,
}: GridHeaderProps) {
  const { saveGridAsGist, isSavingGist } = useGridContext();

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
        display: "flex",
        flexDirection: "row",
        gap: 2,
        justifyContent: "center",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          flex: 1,
          gap: 2,
        }}
      >
        <NextLink href={`/`} passHref>
          <Box
            sx={{
              cursor: "pointer",
              height: "28px",
              width: "28px",
              color: "fg.muted",
              fontWeight: "semibold",
              backgroundColor: "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 2,
              "&:hover": {
                backgroundColor: "#e0e0e0",
                color: "fg.default",
                cursor: "pointer",
              },
            }}
          >
            <ArrowLeftIcon />
          </Box>
        </NextLink>

        <Box>
          <Box
            sx={{
              display: "inline-block",
              fontSize: 2,
              fontWeight: "semibold",
              color: "fg.default",
              mr: 1,
            }}
          >
            {title}
          </Box>
          <CounterLabel>{count}</CounterLabel>
        </Box>
      </Box>
      <Box sx={{ display: "flex", gap: 2 }}>
        <Search />
        <GroupBy />
        <FilterBy />
        <Button onClick={handleSaveGist} disabled={isSavingGist}>
          Save to gist
        </Button>
        <Button variant="primary" onClick={() => setShowNewColumnForm(true)}>
          Add column
        </Button>
      </Box>
    </Box>
  );
}
