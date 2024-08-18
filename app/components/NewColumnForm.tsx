import React, { useState } from "react";
import {
  Box,
  Button,
  TextInput,
  Textarea,
  FormControl,
  Select,
} from "@primer/react";
import { columnTypes } from '../columns';
import type { Option } from '../actions';
type ColumnType = "text" | "single-select" | "multi-select";

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

  const selectedColumnType = columnTypes[type];

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

  function handleTypeChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newType = e.target.value as ColumnType;
    setType((currentType) => {
      if (
        currentType === "text" &&
        (newType === "single-select" || newType === "multi-select")
      ) {
        setOptions([{ title: "", description: "" }]);
      } else if (
        (currentType === "single-select" || currentType === "multi-select") &&
        newType === "text"
      ) {
        setOptions([]);
      }
      return newType;
    });
  }

  function addNewHandler(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    if (title === "") {
      setMessage("Enter a title");
      return;
    }

    let filteredOptions = options.filter((option) => option.title !== "");
    addNewColumn({ title, instructions, type, options: filteredOptions });
    setTitle("");
    setInstructions("");
    setType("text");
    setOptions([]);
  }

  return (
    <Box
      as="form"
      sx={{ gap: 3, display: "flex", flexDirection: "column" }}
      onSubmit={addNewHandler}
    >
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
        <Select value={type} onChange={handleTypeChange}>
          <Select.Option value="text">Text</Select.Option>
          <Select.Option value="single-select">Single-select</Select.Option>
          <Select.Option value="multi-select">Multi-select</Select.Option>
          <Select.Option value="single-select-user">User</Select.Option>
          <Select.Option value="multi-select-user">User list</Select.Option>
        </Select>
      </FormControl>

      {selectedColumnType.formFields && (
        <FormControl>
          <FormControl.Label>Options</FormControl.Label>
          <FormControl.Caption>
            If options are not provided, then the model will choose its own. Make sure to add instructions to help increase accuracy.
          </FormControl.Caption>
          {selectedColumnType.formFields({ options, setOptions })}
        </FormControl>
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
        <Button type="submit" variant="primary">
          Submit
        </Button>
      </Box>
    </Box>
  );
}