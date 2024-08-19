import OpenAI from 'openai';
import { BaseColumnType } from './BaseColumnType';
import { GridCell, Option, MultiSelectCell, MultiSelectResponse} from '../actions';
import { Box, Label, TextInput, IconButton, Button } from '@primer/react';
import { XIcon } from '@primer/octicons-react';

export function multiSelectSchema(
  options: Option[],
): OpenAI.ChatCompletionCreateParams["response_format"] {
  const optionsObj = options && options.length ? {
    type: "array",
    description: 'Select the options that you would like to include in the response. If no options are relevant, select "N/A"',
    items: {
      type: "string",
      enum: ['N/A', ...options.map((o) => o.title)],
    },
  } : {
    type: "array",
    description: 'Define a list of options that you would like to include in the response',
    items: {
      type: "string",
    },
  }
  return {
    type: "json_schema",
    json_schema: {
      name: "multi_select_response",
      strict: true,
      schema: {
        type: "object",
        properties: {
          options: optionsObj
        },
        required: ["options"],
        additionalProperties: false,
      },
    },
  };
}

export const MultiSelectColumnType: BaseColumnType<MultiSelectResponse> = {
  type: 'multi-select',
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
      <Button onClick={() => setOptions([...options, { title: "", description: "" }])}>Add option</Button>
    </Box>
  ),
  renderCell: (cell: MultiSelectCell) => (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
      {cell.response.options.map((option: string, index: number) => (
        <Label key={index}>{option}</Label>
      ))}
    </Box>
  ),
  generateResponseSchema: (options?: Option[]) => multiSelectSchema(options || []),
  buildHydrationPrompt: (cell: MultiSelectCell) => 
    cell.options && cell.options.length > 0
      ? 'Multi select: Select one or more options from the user-provided options below. Your selection should satisfy the provided cell data description.'
      : 'Multi select. The user provided no options to choose from, so you must define your own. Define one or more options that are not overly specific but satisfy the cell data descripton for this cell. Your selection will be used to group cells thematically',
};