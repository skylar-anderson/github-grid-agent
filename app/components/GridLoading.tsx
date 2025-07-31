import React from 'react';
import { Box, Spinner } from '@primer/react';

const GridLoading = React.memo(function GridLoading() {
  return (
    <Box
      sx={{
        height: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          flexDirection: 'column',
        }}
      >
        <Box
          sx={{
            fontSize: 2,
            fontWeight: 'semibold',
            textAlign: 'center',
            pb: 3,
          }}
        >
          Starting grid...
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Spinner size="medium" />
        </Box>
      </Box>
    </Box>
  );
});

export default GridLoading;