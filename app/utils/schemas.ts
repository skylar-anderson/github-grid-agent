import OpenAI from "openai";
import type { GridCell, Option } from "../actions";

export function getResponseFormat(
  cell: GridCell,
): OpenAI.ChatCompletionCreateParams["response_format"] | undefined {
  switch (cell.columnType) {
    case "single-select":
      return singleSelectSchema(cell.options || []);
    case "multi-select":
      return multiSelectSchema(cell.options || []);
    case "multi-select-user":
      return multiSelectUserSchema
    case "single-select-user":
      return singleSelectUserSchema
    case "text":
      return undefined;
    default:
      throw new Error(`Unsupported column type`);
  }
}

const singleSelectUserSchema:OpenAI.ChatCompletionCreateParams["response_format"] = {
  type: "json_schema",
  json_schema: {
    name: "single_select_user_response",
    strict: true,
    schema: {
      type: "object",
      properties: {
        user: {
          type: "string",
          description: 'The handle of the user that you have selected. If there is no clear user to select, use the string "no-user"',
        },
      },
      required: ["user"],
      additionalProperties: false,
    },
  },
}

const multiSelectUserSchema:OpenAI.ChatCompletionCreateParams["response_format"] = {
  type: "json_schema",
  json_schema: {
    name: "multi_select_user_response",
    strict: true,
    schema: {
      type: "object",
      properties: {
        users: {
          type: "array",
          description: "The handles of the users that you have selected. If there are no clear users to select, use an empty array",
          items: {
            type: "string",
          },
        },
      },
      required: ["users"],
      additionalProperties: false,
    },
  },
}

export function singleSelectSchema(
  options: Option[],
): OpenAI.ChatCompletionCreateParams["response_format"] {
  const option = options && options.length ? {
    type: "string",
    enum: options.map((o) => o.title),
  } : {
    type: "string",
    description: 'The title of the option that you have selected',
  }

  return {
    type: "json_schema",
    json_schema: {
      name: "single_select_response",
      strict: true,
      schema: {
        type: "object",
        properties: {
          option
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
  const optionsObj = options && options.length ? {
    type: "array",
    description: 'Select the options that you would like to include in the response. If no options are relevant, select "N/A"',
    items: {
      type: "string",
      enum: ['N/A', options.map((o) => o.title)],
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
