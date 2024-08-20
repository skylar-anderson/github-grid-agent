import OpenAI from "openai";
import { BaseColumnType } from "./BaseColumnType";
import { GridCell, Option, ColumnResponse } from "../actions";
import { Box, Label, TextInput, IconButton } from "@primer/react";
import { XIcon } from "@primer/octicons-react";

export function singleSelectSchema(
  options: Option[],
): OpenAI.ChatCompletionCreateParams["response_format"] {
  const option =
    options && options.length
      ? {
          type: "string",
          description: "The title of the option that you have selected",
          enum: options.map((o) => o.title),
        }
      : {
          type: "string",
          description: "The title of the option that you have selected",
        };

  console.log(options);
  console.log(option);
  return {
    type: "json_schema",
    json_schema: {
      name: "single_select_response",
      strict: true,
      schema: {
        type: "object",
        properties: {
          option,
        },
        required: ["option"],
        additionalProperties: false,
      },
    },
  };
}

export const SingleSelectColumnType: BaseColumnType<"single-select"> = {
  type: "single-select",
  formFields: ({ options, setOptions }) => (
    <Box>
      {options.map((option, index) => (
        <Box key={index} sx={{ display: "flex", gap: 2, mb: 2 }}>
          <TextInput
            sx={{ flex: 1 }}
            placeholder="Option"
            value={option.title}
            onChange={(e) => {
              const newOptions = [...options];
              newOptions[index].title = e.target.value;
              setOptions(newOptions);
            }}
          />
          <TextInput
            sx={{ flex: 1 }}
            placeholder="Description"
            value={option.description}
            onChange={(e) => {
              const newOptions = [...options];
              newOptions[index].description = e.target.value;
              setOptions(newOptions);
            }}
          />
          <IconButton
            aria-labelledby="Remove icon"
            icon={XIcon}
            onClick={() => {
              const newOptions = options.filter((_, i) => i !== index);
              setOptions(newOptions);
            }}
          />
        </Box>
      ))}
    </Box>
  ),
  renderCell: (cell: GridCell<"single-select">) => (
    <Box>
      <Label>{cell.response.option}</Label>
    </Box>
  ),
  generateResponseSchema: (options?: Option[]) =>
    singleSelectSchema(options || []),
  buildHydrationPrompt: (cell: GridCell<"single-select">) =>
    cell.options && cell.options.length > 0
      ? "Single select: Select a single option from the user-provided options below. Your selection should satisfy the provided cell data description."
      : "Single select. The user provided no options to choose from, so you must define your own. Define an option that is not overly specific but satisfies the cell data descripton for this cell. Your selection will be used to group cells thematically",
  parseResponse: (responseContent: string): ColumnResponse["single-select"] => {
    return JSON.parse(responseContent).options;
  },
};
