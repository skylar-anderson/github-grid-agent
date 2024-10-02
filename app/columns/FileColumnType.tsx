import React from "react";
import OpenAI from "openai";
import { BaseColumnType } from "./BaseColumnType";
import { GridCell, ColumnResponse } from "../actions";
import { Text, Label, Box, Link } from "@primer/react";
import { FileIcon } from "@primer/octicons-react";

function fileSchema(
  multiple: boolean
): OpenAI.ChatCompletionCreateParams["response_format"] {
  return {
    type: "json_schema",
    json_schema: {
      name: "file_response",
      strict: true,
      schema: {
        type: "object",
        properties: {
          [multiple ? "files" : "file"]: multiple
            ? {
                type: "array",
                description: "The files that you have selected. If there are no clear files to select, use an empty array",
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
                description: "The file that you have selected. If there is no clear file to select, use null",
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

function File({ file }: { file: { path: string; repository: string } }) {
  const fileUrl = `https://github.com/${file.repository}/blob/main/${file.path}`;
  const fileName = file.path.split("/").pop() || file.path;
  return (
    <Link
      href={fileUrl}
        target="_blank"
        rel="noopener noreferrer"
      //   sx={{
      //     backgroundColor: 'bg.subtle',
      //     border: '1px solid',
      //     borderColor: 'border.muted',
      //     borderRadius: 1,
      //     fontSize: 0,
      //     display: "flex",
      //     alignItems: "center",
      //     gap: 1,
      //     color: "fg.muted",
      //     px: 2,
      //     py: 1,
      //     '&:hover': {
      //       backgroundColor: 'bg.default',
      //       borderColor: 'border.default',
      //       color: 'fg.default',
      //     },
      // }}
    >
      <Label>
        <Text sx={{color: 'fg.muted'}}>File:</Text>
        <Text sx={{color: 'fg.default', fontWeight: 'bold'}}>{fileName}</Text>
      </Label>
    </Link>
  );
}

export const FileColumnType: BaseColumnType<"file"> = {
  type: "file",
  renderCell: (cell: GridCell<"file">) => (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
      {"files" in cell.response ? (
        cell.response.files.length > 0 ? (
          cell.response.files.map((file, index) => (
            <File file={file} key={index} />
          ))
        ) : (
          <>No files selected</>
        )
      ) : cell.response.file ? (
        <File file={cell.response.file} />
      ) : (
        <>No file selected</>
      )}
    </Box>
  ),
  generateResponseSchema: (_, multiple?: boolean) =>
    fileSchema(multiple || false),
  buildHydrationPrompt: (cell: GridCell<"file">) =>
    `Select ${cell.multiple ? "files" : "a file"}: Select ${
      cell.multiple ? "multiple files" : "a file"
    } and reply with their path and repository`,
  parseResponse: (
    responseContent: string,
    multiple?: boolean
  ): ColumnResponse["file"] => {
    const parsed = JSON.parse(responseContent);
    return multiple ? { files: parsed.files } : { file: parsed.file };
  },
};