"use client";

import type {
  SuccessfulPrimaryColumnResponse,
  ErrorResponse,
  GridCell,
} from "../actions";
import { GridProvider, useGridContext } from "./GridContext";
import { Box } from "@primer/react";
import React, { useEffect } from "react";
import GridTable from "./GridTable";
import GridIntroForm from "./GridIntroForm";

import "./Grid.css";

type Props = {
  createPrimaryColumn: (
    s: string,
  ) => Promise<SuccessfulPrimaryColumnResponse | ErrorResponse>;
  hydrateCell: (s: GridCell) => Promise<{ promise: Promise<GridCell> }>;
  initialGridId?: string;
};

function GridContent({ initialGridId }: { initialGridId?: string }) {
  const { gridState, setCurrentGridId } = useGridContext();

  useEffect(() => {
    if (initialGridId) {
      setCurrentGridId(initialGridId);
    }
  }, [setCurrentGridId, initialGridId]);

  return (
    <div className="grid-app">
      {gridState || initialGridId ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            width: "100vw",
            height: "100vh",
            overflow: "hidden",
            backgroundColor: "canvas.inset",
          }}
        >
          <GridTable />
        </Box>
      ) : (
        <div>
          <GridIntroForm />
        </div>
      )}
    </div>
  );
}

export default function Grid(props: Props) {
  return (
    <GridProvider
      hydrateCell={props.hydrateCell}
      createPrimaryColumn={props.createPrimaryColumn}
    >
      <GridContent initialGridId={props.initialGridId} />
    </GridProvider>
  );
}