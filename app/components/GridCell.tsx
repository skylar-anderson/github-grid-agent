import { Box } from "@primer/react";

export default function GridCell({
  sx,
  children,
  onClick,
  isSelected = false,
}: {
  sx?: any;
  children: React.ReactNode;
  onClick?: () => void;
  isSelected?: boolean;
}) {
  const hoverProps = onClick
    ? {
        ":hover": {
          backgroundColor: "canvas.inset",
          cursor: "pointer",
          transition: "background-color 300ms ease-in-out",
        },
      }
    : {};
  const selectedProps = {
    backgroundColor: "canvas.inset",
  };
  return (
    <Box
      sx={{
        wordWrap: "break-word",
        display: "flex",
        flexShrink: 0,
        overflowY: "scroll",
        flexDirection: "column",
        position: "relative",
        p: 3,
        fontSize: 1,
        boxSizing: "border-box",
        minWidth: "var(--cell-width)",
        //maxWidth: "640px",
        height: "var(--cell-height)",
        borderBottom: "1px solid",
        borderColor: "border.default",
        overflow: "hidden",
        "&:last-child": {
          border: 0,
        },
        ...(isSelected ? selectedProps : {}),
        ...hoverProps,
        ...sx,
      }}
      onClick={onClick}
    >
      {children}
    </Box>
  );
}
