import OpenAI from "openai";
import type { GridCell, Option } from "../actions";

export function getResponseFormat(
  cell: GridCell,
): OpenAI.ChatCompletionCreateParams["response_format"] | undefined {
  if (cell.columnType === "single-select") {
    return singleSelectSchema(cell.options || []);
  }

  if (cell.columnType === "multi-select") {
    return multiSelectSchema(cell.options || []);
  }

  return undefined;
}

export function singleSelectSchema(
  options: Option[],
): OpenAI.ChatCompletionCreateParams["response_format"] {
  return {
    type: "json_schema",
    json_schema: {
      name: "single_select_response",
      strict: true,
      schema: {
        type: "object",
        properties: {
          option: {
            type: "string",
            enum: options.map((o) => o.title),
          },
        },
        required: ["option"],
        additionalProperties: false,
      },
    },
  };
}

export function multiSelectSchema(
  options: Option[],
): OpenAI.ChatCompletionCreateParams["response_format"] {
  return {
    type: "json_schema",
    json_schema: {
      name: "multi_select_response",
      strict: true,
      schema: {
        type: "object",
        properties: {
          options: {
            type: "array",
            items: {
              type: "string",
              enum: options.map((o) => o.title),
            },
          },
        },
        required: ["options"],
        additionalProperties: false,
      },
    },
  };
}
