import { useState } from "react";
import { Button, Box, Spinner, TextInput } from "@primer/react";
import "./Grid.css";
import { useGridContext } from "./GridContext";

function GridLoading() {
  return (
    <Box
      sx={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        <Box
          sx={{
            fontSize: 2,
            fontWeight: "semibold",
            textAlign: "center",
            pb: 3,
          }}
        >
          Starting grid...
        </Box>
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <Spinner size="medium" />
        </Box>
      </Box>
    </Box>
  );
}

export default function CreateIntroForm() {
  const [state, setState] = useState<"empty" | "loading" | "done">("empty");
  const [inputValue, setInputValue] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const { inititializeGrid } = useGridContext();

  if (state === "loading") {
    return <GridLoading />;
  }

  async function createGrid(inputValue: string) {
    if (!inputValue) {
      alert("Please enter a value");
      return;
    }
    setState("loading");
    try {
      const response = await inititializeGrid(inputValue);
    } catch (e: any) {
      setErrorMessage(e.message);
    }
    setState("done");
  }

  const suggestions = [
    "Merged PRs in primer/design",
    "Open issues in primer/design",
    "The action list component in primer/react",
    //"Closed PRs in vercel/swr",
    //"The files changed in the most recently closed pull request in primer/react",
  ];

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        width: "100vw",
        height: "100vh",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Box sx={{ width: "800px" }}>
        <Box
          as="h1"
          sx={{
            fontSize: 4,
            mb: 2,
            fontWeight: "semibold",
            color: "fg.default",
          }}
        >
          Data Grid Agent
        </Box>
        <Box as="p" sx={{ color: "fg.muted" }}>
          Use natural language to easily populate the contents of a data grid
          with the Data Grid Agent. To get started, just describe the data you
          want to explore below. Once your grid is started, just add the columns
          that you want to populate and the data grid agent handles the rest.
          Have fun!{" "}
          <a href="https://github.com/skylar-anderson/openai-chat-playground/tree/main/app/grid">
            Source
          </a>
        </Box>

        <Box>
          <Box sx={{ display: "flex", flexDirection: "row", gap: 2 }}>
            {suggestions.map((s) => (
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: "canvas.default",
                  border: "1px solid",
                  borderColor: "transparent",
                  display: "flex",
                  gap: 2,
                  alignItems: "center",
                  color: "fg.muted",
                  "&:hover": {
                    //backgroundColor: 'canvas.inset',
                    cursor: "pointer",
                    border: "1px solid",
                    borderColor: "border.default",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                    transition: "all 360ms ease-in-out",
                    color: "fg.default",
                  },
                }}
                key={s}
                as="button"
                onClick={() => {
                  createGrid(s);
                }}
              >
                <Box sx={{ flex: 0 }}>✨</Box>
                <Box sx={{ flex: 1, textAlign: "left" }}>{s}</Box>
              </Box>
            ))}
          </Box>
        </Box>

        <Box
          as="form"
          sx={{ width: "100%", display: "flex", gap: 2, pt: 2, px: 0 }}
          onSubmit={() => createGrid(inputValue)}
        >
          {errorMessage && <div className="error-message">{errorMessage}</div>}
          <TextInput
            type="text"
            placeholder="Describe the data you want to see in the grid..."
            value={inputValue}
            block
            size="large"
            onChange={(e) => setInputValue(e.target.value)}
          />
          <Button
            size="large"
            variant="primary"
            onClick={() => createGrid(inputValue)}
          >
            Submit
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
