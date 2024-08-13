import { IconButton, Box, ActionMenu, ActionList } from "@primer/react";
import { KebabHorizontalIcon, PencilIcon, TrashIcon } from "@primer/octicons-react";
import { useGridContext } from "./GridContext";

export default function ColumnTitle({ title, index }: { title: string, index?: number }) {
  const { deleteColumnByIndex } = useGridContext();
  return (
    <Box
      sx={{
        p:2,
        pl: 3,
        flex: 1,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        zIndex: 2,
        position: "sticky",
        top: 0,
        fontSize: 1,
        backgroundColor: "white",
        color: "fg.default",
        fontWeight: "semibold",
        borderRight: "1px solid",
        borderColor: "border.default",
        minWidth: "260px",
        '&:last-child': {
          border: 0
        }
      }}
    >
      <Box sx={{flex: 1}}>{title}</Box>
      
      <ActionMenu>
        <ActionMenu.Anchor>
          <IconButton variant="invisible" aria-labelledby="Column menu" icon={KebabHorizontalIcon} />
        </ActionMenu.Anchor>
        <ActionMenu.Overlay width="medium">
          <ActionList>
            {index !== undefined && (
              <ActionList.Item onSelect={() => deleteColumnByIndex(index) }>
                <ActionList.LeadingVisual><TrashIcon /></ActionList.LeadingVisual>
                Delete
              </ActionList.Item>
            )}
            <ActionList.Item onSelect={() => alert('Copy link clicked')}>
              <ActionList.LeadingVisual><PencilIcon /></ActionList.LeadingVisual>
              Edit
            </ActionList.Item>
          </ActionList>
        </ActionMenu.Overlay>
      </ActionMenu>
      
    </Box>
  );
}