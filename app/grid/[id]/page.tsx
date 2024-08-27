import { createPrimaryColumn, hydrateCell } from "../../actions";
import { BaseStyles, ThemeProvider } from "@primer/react";
import Grid from "../../components/Grid";

export default function GridPage({ params }: { params: { id: string } }) {
  return (
    <ThemeProvider>
      <BaseStyles>
        <Grid
          createPrimaryColumn={createPrimaryColumn}
          hydrateCell={hydrateCell}
          initialGridId={params.id}
        />
      </BaseStyles>
    </ThemeProvider>
  );
}