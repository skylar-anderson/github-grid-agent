import { Box, Avatar, Text, IconButton } from '@primer/react';
import { useState } from 'react';
import RepoDetails from './RepoDetails';
import { marked } from 'marked';
import { ChevronUpIcon, ChevronDownIcon } from '@primer/octicons-react';
import { avatarUrl } from '@/app/utils/avatarUrl';
export type Issue = {
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

function IssueDetails({ issue }: { issue: Issue }) {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <Box sx={{}}>
      <Box sx={{ mb: 3 }}>
        <Box
          as="a"
          href={issue.url}
          sx={{
            display: 'block',
            color: 'fg.default',
            textDecoration: 'none',
            fontSize: 3,
            fontWeight: 'semibold',
            lineHeight: 1.33,
            mb: 1,
          }}
        >
          {issue.title}
          <Text sx={{ color: 'fg.muted' }}> #{issue.number}</Text>
        </Box>
        <RepoDetails organization="primer" repository="react" />
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
            opened this issue on {new Date(issue.url).toLocaleDateString()}
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
            dangerouslySetInnerHTML={{ __html: marked.parse(issue.body) }}
          />
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
    </Box>
  );
}

export default IssueDetails;
