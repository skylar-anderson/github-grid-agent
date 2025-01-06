import { Box, IconButton } from '@primer/react';
import { Snippet } from '@/app/functions/semanticCodeSearch';
import RepoDetails from './RepoDetails';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { solarizedlight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useState } from 'react';
import { ChevronUpIcon, ChevronDownIcon } from '@primer/octicons-react';

export default function SnippetDetails({ snippet }: { snippet: Snippet }) {
  const [open, setOpen] = useState<boolean>(false);
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <RepoDetails organization={snippet.owner} repository={snippet.repo} />
      <Box
        sx={{
          border: '1px solid',
          borderColor: 'border.default',
          borderRadius: 2,
          maxHeight: open ? 'none' : '225px',
          overflow: 'hidden',
          position: 'relative',
          transition: 'max-height 0.3s ease',
        }}
      >
        <SyntaxHighlighter
          language="javascript"
          style={solarizedlight}
          customStyle={{ fontSize: '12px', margin: 0, backgroundColor: 'transparent' }}
        >
          {snippet.content}
        </SyntaxHighlighter>
        {open ? (
          <IconButton
            icon={ChevronUpIcon}
            aria-label="Show less"
            onClick={() => setOpen(false)}
            sx={{
              position: 'absolute',
              bottom: 2,
              right: 2,
              backgroundColor: 'canvas.default',
            }}
          />
        ) : (
          <IconButton
            icon={ChevronDownIcon}
            aria-label="Show more"
            onClick={() => setOpen(true)}
            sx={{
              position: 'absolute',
              bottom: 2,
              right: 2,
              backgroundColor: 'canvas.default',
            }}
          />
        )}
      </Box>
    </Box>
  );
}
