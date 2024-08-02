import { useState } from "react";
import { Box, Button, TextInput, Textarea, FormControl } from "@primer/react";
import GridCell from "./GridCell";

type Props = {
  addNewColumn: ({
    title,
    instructions,
  }: {
    title: string;
    instructions: string;
  }) => void;
  errorMessage?: string;
};

export default function NewColumnForm({ addNewColumn, errorMessage }: Props) {
  const [title, setTitle] = useState<string>("");
  const [instructions, setInstructions] = useState<string>("");
  const [message, setMessage] = useState<string>(
    errorMessage ? errorMessage : "",
  );
  function addNewHandler(e: any) {
    e.preventDefault();
    setMessage("");

    if (title === "") {
      setMessage("enter a value");
      return;
    }

    addNewColumn({ title, instructions });
    setTitle("");
    setInstructions("");
    return false;
  }

  return (
    <Box>
      <Box sx={{}}>
        {message && <div className="error-message">{message}</div>}
        <Box
          as="form"
          sx={{ gap: 3, display: "flex", flexDirection: "column" }}
          onSubmit={addNewHandler}
        >
          <FormControl>
            <FormControl.Label>Title</FormControl.Label>
            <TextInput
              type="text"
              value={title}
              block={true}
              onChange={(e) => setTitle(e.target.value)}
            />
            <FormControl.Caption>
              Will be included in prompt
            </FormControl.Caption>
          </FormControl>

          <FormControl>
            <FormControl.Label>Instructions</FormControl.Label>
            <Textarea
              placeholder="Describe how this field should be populated..."
              value={instructions}
              block={true}
              rows={24}
              onChange={(e) => setInstructions(e.target.value)}
            />
            <FormControl.Caption>
              Optional but recommended. Add detailed instructions about how the
              column should render.
            </FormControl.Caption>
          </FormControl>

          <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
            <Button onClick={addNewHandler}>Cancel</Button>
            <Button variant="primary" onClick={addNewHandler}>
              Submit
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
