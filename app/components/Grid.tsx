"use client";

import type {
  SuccessfulPrimaryColumnResponse,
  ErrorResponse,
  GridCell,
} from "../actions";
import { GridProvider, useGridContext } from "./GridContext";
import { Box } from "@primer/react";
import React from "react";
import GridTable from "./GridTable";
import GridIntroForm from "./GridIntroForm";

import "./Grid.css";

type Props = {
  createPrimaryColumn: (
    s: string,
  ) => Promise<SuccessfulPrimaryColumnResponse | ErrorResponse>;
  hydrateCell: (s: GridCell) => Promise<{ promise: Promise<GridCell> }>;
};

function GridContent() {
  const { gridState } = useGridContext();
  return (
    <div className="grid-app">
      {gridState ? (
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
      <GridContent />
    </GridProvider>
  );
}
