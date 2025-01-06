import { avatarUrl } from '@/app/utils/avatarUrl';
import { Box, Avatar } from '@primer/react';
function RepoDetails({ organization, repository }: { organization: string; repository: string }) {
  const tokenStyle = {
    fontSize: 0,
    color: 'fg.muted',
    textDecoration: 'none',
    '&:hover': {
      textDecoration: 'underline',
    },
  };

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 1,
        width: 'fit-content',
        alignItems: 'center',
      }}
    >
      <Avatar src={avatarUrl(organization)} size={16} square={true} sx={{ mr: 1 }} />
      <Box sx={tokenStyle} as="a" href="#">
        {organization}
      </Box>
      <Box sx={tokenStyle}>/</Box>
      <Box sx={tokenStyle} as="a" href="#">
        {repository}
      </Box>
    </Box>
  );
}

export default RepoDetails;
