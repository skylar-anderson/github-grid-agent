import { useState } from "react";
import { Button, Box, Spinner } from "@primer/react";
import "./Grid.css";
import "./Intro.css";
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
    "merged pull requests on primer/design",
    "files related to the Action List component in primer/react",
    "recently closed pull requests in the vercel/swr repository",
    "the files changed in the most recently closed pull request in primer/react",
  ];

  return (
    <div className="intro-layout">
      <div className="intro">
        <h1 className="title">Data Grid Agent</h1>
        <p className="description">
          Use natural language to easily populate the contents of a data grid
          with the Data Grid Agent. To get started, just describe the data you
          want to explore below. Once your grid is started, just add the columns
          that you want to populate and the data grid agent handles the rest.
          Have fun!{" "}
          <a href="https://github.com/skylar-anderson/openai-chat-playground/tree/main/app/grid">
            Source
          </a>
        </p>

        <form onSubmit={() => createGrid(inputValue)} className="intro-form">
          {errorMessage && <div className="error-message">{errorMessage}</div>}
          <input
            className="input"
            type="text"
            placeholder="Describe the data you want to see in the grid..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <Button onClick={() => createGrid(inputValue)}>Submit</Button>
        </form>

        <div className="suggestions">
          <h3>Try it</h3>
          {suggestions.map((s) => (
            <Button
              sx={{ mb: 2 }}
              key={s}
              variant="invisible"
              onClick={() => {
                createGrid(s);
              }}
            >
              <Box sx={{ color: "fg.default" }}>✨ {s}</Box>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
