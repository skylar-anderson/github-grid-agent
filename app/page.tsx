import { createPrimaryColumn, hydrateCell } from "./actions";
import { BaseStyles, ThemeProvider } from "@primer/react";

import Grid from "./components/Grid";

export default function Page() {
  return (
    <ThemeProvider>
      <BaseStyles>
        <Grid
          createPrimaryColumn={createPrimaryColumn}
          hydrateCell={hydrateCell}
        />
      </BaseStyles>
    </ThemeProvider>
  );
}
