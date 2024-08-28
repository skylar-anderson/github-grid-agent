import React from "react";
import OpenAI from "openai";
import { BaseColumnType } from "./BaseColumnType";
import { GridCell, ColumnResponse } from "../actions";
import { Box, Link } from "@primer/react";
import { FileIcon } from "@primer/octicons-react";

function selectFileSchema(
  multiple: boolean,
): OpenAI.ChatCompletionCreateParams["response_format"] {
  return {
    type: "json_schema",
    json_schema: {
      name: "select_file_response",
      strict: true,
      schema: {
        type: "object",
        properties: {
          [multiple ? "files" : "file"]: multiple
            ? {
                type: "array",
                description:
                  "The paths of the files that you have selected. If there are no clear files to select, use an empty array",
                items: {
                  type: "object",
                  properties: {
                    path: { type: "string" },
                    repository: { type: "string" },
                  },
                  required: ["path", "repository"],
                  additionalProperties: false,
                },
              }
            : {
                type: "object",
                properties: {
                  path: { type: "string" },
                  repository: { type: "string" },
                },
                required: ["path", "repository"],
                additionalProperties: false,
              },
        },
        required: [multiple ? "files" : "file"],
        additionalProperties: false,
      },
    },
  };
}

function FileLink({ path, repository }: { path: string; repository: string }) {
  const url = `https://github.com/${repository}/blob/main/${path}`;
  return (
    <Link href={url} target="_blank">
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <FileIcon size={24} />
        <Box sx={{ fontWeight: "semibold", color: "fg.default" }}>{path}</Box>
      </Box>
    </Link>
  );
}

export const SelectFileColumnType: BaseColumnType<"select-file"> = {
  type: "select-file",
  renderCell: (cell: GridCell<"select-file">) => (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
      {"files" in cell.response ? (
        cell.response.files.length > 0 ? (
          cell.response.files.map((file, index) => (
            <FileLink path={file.path} repository={file.repository} key={index} />
          ))
        ) : (
          <>No files selected</>
        )
      ) : (
        <FileLink path={cell.response.file.path} repository={cell.response.file.repository} />
      )}
    </Box>
  ),
  generateResponseSchema: (_, multiple?: boolean) =>
    selectFileSchema(multiple || false),
  buildHydrationPrompt: (cell: GridCell<"select-file">) =>
    `Select ${cell.multiple ? "files" : "a file"}: Select ${cell.multiple ? "multiple files" : "a file"} and reply only with their paths and repositories`,
  parseResponse: (
    responseContent: string,
    multiple?: boolean,
  ): ColumnResponse["select-file"] => {
    const parsed = JSON.parse(responseContent);
    return multiple ? { files: parsed.files } : { file: parsed.file };
  },
};