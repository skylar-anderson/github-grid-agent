import { createPrimaryColumn, hydrateCell } from '../../actions';
import Grid from '../../components/Grid';

export default function GridPage({ params }: { params: { id: string } }) {
  return (
    <Grid
      createPrimaryColumn={createPrimaryColumn}
      hydrateCell={hydrateCell}
      initialGridId={params.id}
    />
  );
}
