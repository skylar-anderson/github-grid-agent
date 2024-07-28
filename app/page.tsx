import { createPrimaryColumn, hydrateCell } from "./actions";
import {ThemeProvider} from '@primer/react'

import Grid from "./components/Grid";

export default function Page() {
  return (
    <ThemeProvider>
      <Grid createPrimaryColumn={createPrimaryColumn} hydrateCell={hydrateCell} />
    </ThemeProvider>
  );
}
