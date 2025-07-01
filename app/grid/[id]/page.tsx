'use client';

import { createPrimaryColumn, hydrateCell } from '../../actions';
import { BaseStyles, ThemeProvider as PrimerThemeProvider } from '@primer/react';
import { ThemeProvider } from '../../components/ThemeContext';
import { useTheme } from '../../components/ThemeContext';
import Grid from '../../components/Grid';

function ThemedApp({ initialGridId }: { initialGridId: string }) {
  const { colorMode, isLoaded } = useTheme();
  
  // Don't render until theme is loaded to prevent hydration mismatch
  if (!isLoaded) {
    return (
      <PrimerThemeProvider colorMode="light">
        <BaseStyles>
          <Grid
            createPrimaryColumn={createPrimaryColumn}
            hydrateCell={hydrateCell}
            initialGridId={initialGridId}
          />
        </BaseStyles>
      </PrimerThemeProvider>
    );
  }
  
  return (
    <PrimerThemeProvider colorMode={colorMode}>
      <BaseStyles>
        <Grid
          createPrimaryColumn={createPrimaryColumn}
          hydrateCell={hydrateCell}
          initialGridId={initialGridId}
        />
      </BaseStyles>
    </PrimerThemeProvider>
  );
}

export default function GridPage({ params }: { params: { id: string } }) {
  return (
    <ThemeProvider>
      <ThemedApp initialGridId={params.id} />
    </ThemeProvider>
  );
}
