import React from "react";
import OpenAI from "openai";
import { BaseColumnType } from "./BaseColumnType";
import { GridCell, ColumnResponse } from "../actions";
import { Box, Link } from "@primer/react";
import { FileIcon } from "@primer/octicons-react";

function selectIssueSchema(
  multiple: boolean,
): OpenAI.ChatCompletionCreateParams["response_format"] {
  return {
    type: "json_schema",
    json_schema: {
      name: "select_issue_response",
      strict: true,
      schema: {
        type: "object",
        properties: {
          [multiple ? "issues" : "issue"]: multiple
            ? {
                type: "array",
                description:
                  "The paths of the files that you have selected. If there are no clear files to select, use an empty array",
                items: {
                  type: "object",
                  properties: {
                    repository: { type: "string" },
                    issue: { type: "string" },
                  },
                  required: ["repository", "issue"],
                  additionalProperties: false,
                },
              }
            : {
                type: "object",
                properties: {
                  repository: { type: "string" },
                  issue: { type: "string" },
                },
                required: ["repository", "issue"],
                additionalProperties: false,
              },
        },
        required: [multiple ? "files" : "file"],
        additionalProperties: false,
      },
    },
  };
}
