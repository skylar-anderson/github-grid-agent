import { useState } from "react";
import { Box } from "@primer/react";
import { Dialog } from "@primer/react/experimental";

export default function DebugDialog({ prompt, sources }: { prompt: string, sources: string[] }) {
  const [open, setOpen] = useState<boolean>(false);
  return (
    <>
      <Box
        as="button"
        sx={{
          fontSize: 0,
          color: "fg.muted",
          border: 0,
          p: 1,
          backgroundColor: "transparent",
          cursor: "pointer",
          "&:hover": {
            color: "fg.default",
          },
        }}
        onClick={() => setOpen(true)}
      >
        Debug
      </Box>

      { open && <Dialog title="Debug" onClose={() => setOpen(false)}>
        
          {sources.length > 0 && (
            <>
              <Box sx={{ fontSize: 0, pb: 2, fontWeight: "semibold", color: "fg.muted" }}>
                Sources used:
              </Box>
              {sources.map((source) => (
                <Box key={source} sx={{ fontSize: 0, pb: 2, color: "fg.muted" }}>
                  {source}
                </Box>
              ))}
            </>
          )}
          
          {prompt && (
            <>
              <Box sx={{ fontSize: 0, pb: 2, fontWeight: "semibold", color: "fg.muted" }}>
                Prompt used:
              </Box>
              <Box
                as="pre"
                sx={{
                  p: 3,
                  backgroundColor: "canvas.inset",
                  borderRadius: 2,
                  wordWrap: "break-word",
                  fontSize: 0,
                  m: 0,
                  fontFamily: "mono",
                  whiteSpace: "pre-wrap",
                  lineHeight: "22px",
                }}
              >
                {prompt}
              </Box>
            </>
          )}
          
        </Dialog>
      }
    </>
  );
}