import OpenAI from "openai";
import { BaseColumnType } from "./BaseColumnType";
import { Option, ColumnResponse, GridCell } from "../actions";
import { Box, Label, TextInput, IconButton, Button } from "@primer/react";
import { XIcon } from "@primer/octicons-react";

export function selectSchema(
  options: Option[],
  multiple: boolean,
): OpenAI.ChatCompletionCreateParams["response_format"] {
  const optionsObj =
    options && options.length
      ? {
          type: multiple ? "array" : "string",
          description: multiple
            ? 'Select the options that you would like to include in the response. If no options are relevant, select "N/A"'
            : "Select a single option that best fits the response",
          ...(multiple
            ? {
                items: {
                  type: "string",
                  enum: ["N/A", ...options.map((o) => o.title)],
                },
              }
            : {
                enum: options.map((o) => o.title),
              }),
        }
      : {
          type: multiple ? "array" : "string",
          description: multiple
            ? "Define a list of options that you would like to include in the response"
            : "Define a single option that best fits the response",
          ...(multiple
            ? {
                items: {
                  type: "string",
                },
              }
            : {}),
        };

  return {
    type: "json_schema",
    json_schema: {
      name: "select_response",
      strict: true,
      schema: {
        type: "object",
        properties: {
          [multiple ? "options" : "option"]: optionsObj,
        },
        required: [multiple ? "options" : "option"],
        additionalProperties: false,
      },
    },
  };
}

export const SelectColumnType: BaseColumnType<"select"> = {
  type: "select",
  formFields: ({ options, setOptions }) => (
    <>
      {options.map((option, index) => (
        <Box key={index} sx={{ display: "flex", width: "100%", gap: 2, mb: 2 }}>
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
      <Button
        onClick={() => setOptions([...options, { title: "", description: "" }])}
      >
        Add option
      </Button>
    </>
  ),
  renderCell: (cell: GridCell<"select">) => (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
      {"options" in cell.response ? (
        cell.response.options.map((option: string, index: number) => (
          <Label key={index} sx={{border:0, backgroundColor:'canvas.inset', gap: 1 }}>{option}</Label>
        ))
      ) : (
        <Label sx={{border:0, backgroundColor:'canvas.inset', gap: 1 }}>{cell.response.option}</Label>
      )}
    </Box>
  ),
  generateResponseSchema: (options?: Option[], multiple?: boolean) =>
    selectSchema(options || [], multiple || false),
  buildHydrationPrompt: (cell: GridCell<"select">) =>
    cell.options && cell.options.length > 0
      ? `${cell.multiple ? "Multi" : "Single"} select: Select ${cell.multiple ? "one or more options" : "a single option"} from the user-provided options below. Your selection should satisfy the provided cell data description.`
      : `${cell.multiple ? "Multi" : "Single"} select. The user provided no options to choose from, so you must define your own. Define ${cell.multiple ? "one or more options" : "an option"} that are not overly specific but satisfy the cell data descripton for this cell. Your selection will be used to group cells thematically`,
  parseResponse: (
    responseContent: string,
    multiple?: boolean,
  ): ColumnResponse["select"] => {
    const parsed = JSON.parse(responseContent);
    return multiple ? { options: parsed.options } : { option: parsed.option };
  },
};
