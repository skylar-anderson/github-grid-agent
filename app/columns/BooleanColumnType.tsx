import React from "react";
import OpenAI from "openai";
import { BaseColumnType } from "./BaseColumnType";
import { GridCell, ColumnResponse } from "../actions";
import { Label } from "@primer/react";

function booleanSchema(): OpenAI.ChatCompletionCreateParams["response_format"] {
  return {
    type: "json_schema",
    json_schema: {
      name: "boolean_response",
      strict: true,
      schema: {
        type: "object",
        properties: {
          value: {
            type: "boolean",
            description: "The boolean value (true or false) for this cell",
          },
        },
        required: ["value"],
        additionalProperties: false,
      },
    },
  };
}

export const BooleanColumnType: BaseColumnType<"boolean"> = {
  type: "boolean",
  renderCell: (cell: GridCell<"boolean">) => (
    <Label variant={cell.response.value ? "success" : "danger"}>
      {cell.response.value ? "Yes" : "No"}
    </Label>
  ),
  generateResponseSchema: () => booleanSchema(),
  buildHydrationPrompt: () =>
    "Boolean: Determine if the statement is true or false and reply with a boolean value (true or false)",
  parseResponse: (responseContent: string): ColumnResponse["boolean"] => {
    const parsed = JSON.parse(responseContent);
    return { value: parsed.value };
  },
};