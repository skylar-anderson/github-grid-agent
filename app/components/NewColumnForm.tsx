import { useState } from "react";
import { Box, Button, TextInput, Textarea, FormControl, Select } from "@primer/react";
import GridCell from "./GridCell";

type Props = {
  addNewColumn: ({
    title,
    instructions,
    type,
    options,
  }: {
    title: string;
    instructions: string;
    type: "text" | "single-select" | "multi-select";
    options?: { title: string; description: string }[];
  }) => void;
  errorMessage?: string;
};

export default function NewColumnForm({ addNewColumn, errorMessage }: Props) {
  const [title, setTitle] = useState<string>("");
  const [instructions, setInstructions] = useState<string>("");
  const [type, setType] = useState<"text" | "single-select" | "multi-select">("text");
  const [options, setOptions] = useState<{ title: string; description: string }[]>([]);
  const [optionTitle, setOptionTitle] = useState<string>("");
  const [optionDescription, setOptionDescription] = useState<string>("");
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

    addNewColumn({ title, instructions, type, options });
    setTitle("");
    setInstructions("");
    setType("text");
    setOptions([]);
    return false;
  }

  function addOptionHandler(e: any) {
    e.preventDefault();
    if (optionTitle === "" || optionDescription === "") {
      setMessage("enter both title and description for the option");
      return;
    }
    setOptions([...options, { title: optionTitle, description: optionDescription }]);
    setOptionTitle("");
    setOptionDescription("");
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

          <FormControl>
            <FormControl.Label>Type</FormControl.Label>
            <Select
              value={type}
              onChange={(e) => setType(e.target.value as "text" | "single-select" | "multi-select")}
            >
              <Select.Option value="text">Text</Select.Option>
              <Select.Option value="single-select">Single Select</Select.Option>
              <Select.Option value="multi-select">Multi Select</Select.Option>
            </Select>
          </FormControl>

          {(type === "single-select" || type === "multi-select") && (
            <Box>
              <FormControl>
                <FormControl.Label>Option Title</FormControl.Label>
                <TextInput
                  type="text"
                  value={optionTitle}
                  block={true}
                  onChange={(e) => setOptionTitle(e.target.value)}
                />
              </FormControl>

              <FormControl>
                <FormControl.Label>Option Description</FormControl.Label>
                <Textarea
                  placeholder="Describe the option..."
                  value={optionDescription}
                  block={true}
                  rows={3}
                  onChange={(e) => setOptionDescription(e.target.value)}
                />
              </FormControl>

              <Button onClick={addOptionHandler}>Add Option</Button>

              <Box>
                {options.map((option, index) => (
                  <Box key={index}>
                    <strong>{option.title}</strong>: {option.description}
                  </Box>
                ))}
              </Box>
            </Box>
          )}

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
