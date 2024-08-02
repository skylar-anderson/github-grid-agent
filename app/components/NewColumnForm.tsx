import React, { useState } from "react";
import { Box, Button, TextInput, Textarea, FormControl, Select, Label } from "@primer/react";

type ColumnType = "text" | "single-select" | "multi-select";

type Option = {
  title: string;
  description: string;
};

type Props = {
  addNewColumn: ({
    title,
    instructions,
    type,
    options,
  }: {
    title: string;
    instructions: string;
    type: ColumnType;
    options: Option[];
  }) => void;
  errorMessage?: string;
};

export default function NewColumnForm({ addNewColumn, errorMessage }: Props) {
  const [title, setTitle] = useState<string>("");
  const [instructions, setInstructions] = useState<string>("");
  const [type, setType] = useState<ColumnType>("text");
  const [options, setOptions] = useState<Option[]>([]);
  const [message, setMessage] = useState<string>(errorMessage || "");

  const addOption = () => {
    setOptions([...options, { title: "", description: "" }]);
  };

  const updateOption = (index: number, field: keyof Option, value: string) => {
    const newOptions = [...options];
    newOptions[index][field] = value;
    setOptions(newOptions);
  };

  const removeOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  function addNewHandler(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    if (title === "") {
      setMessage("Enter a title");
      return;
    }

    if ((type === "single-select" || type === "multi-select") && options.length === 0) {
      setMessage("Add at least one option for select types");
      return;
    }

    addNewColumn({ title, instructions, type, options });
    setTitle("");
    setInstructions("");
    setType("text");
    setOptions([]);
  }

  return (
    <Box as="form" sx={{ gap: 3, display: "flex", flexDirection: "column" }} onSubmit={addNewHandler}>
      {message && <Box sx={{ color: "danger.fg" }}>{message}</Box>}
      
      <FormControl>
        <FormControl.Label>Title</FormControl.Label>
        <TextInput
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          block
        />
      </FormControl>

      <FormControl>
        <FormControl.Label>Type</FormControl.Label>
        <Select value={type} onChange={(e) => setType(e.target.value as ColumnType)}>
          <Select.Option value="text">Text</Select.Option>
          <Select.Option value="single-select">Single Select</Select.Option>
          <Select.Option value="multi-select">Multi Select</Select.Option>
        </Select>
      </FormControl>

      {(type === "single-select" || type === "multi-select") && (
        <Box>
          <FormControl.Label>Options</FormControl.Label>
          {options.map((option, index) => (
            <Box key={index} sx={{ display: "flex", gap: 2, mb: 2 }}>
              <TextInput
                placeholder="Title"
                value={option.title}
                onChange={(e) => updateOption(index, "title", e.target.value)}
              />
              <TextInput
                placeholder="Description"
                value={option.description}
                onChange={(e) => updateOption(index, "description", e.target.value)}
              />
              <Button onClick={() => removeOption(index)}>Remove</Button>
            </Box>
          ))}
          <Button onClick={addOption}>Add Option</Button>
        </Box>
      )}

      <FormControl>
        <FormControl.Label>Instructions</FormControl.Label>
        <Textarea
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          placeholder="Describe how this field should be populated..."
          rows={6}
          block
        />
      </FormControl>

      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Button type="submit" variant="primary">Submit</Button>
      </Box>
    </Box>
  );
}