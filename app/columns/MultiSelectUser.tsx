import React from "react";
import OpenAI from "openai";
import { BaseColumnType } from "./BaseColumnType";
import { GridCell, ColumnResponse } from "../actions";
import { Box, Avatar } from "@primer/react";

const multiSelectUserSchema: OpenAI.ChatCompletionCreateParams["response_format"] =
  {
    type: "json_schema",
    json_schema: {
      name: "multi_select_user_response",
      strict: true,
      schema: {
        type: "object",
        properties: {
          users: {
            type: "array",
            description:
              "The handles of the users that you have selected. If there are no clear users to select, use an empty array",
            items: {
              type: "string",
            },
          },
        },
        required: ["users"],
        additionalProperties: false,
      },
    },
  };

const avatarUrl = (handle: string, size: number = 200) =>
  `https://github.com/${handle}.png?size=${size}`;

function User({ handle }: { handle: string }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
      <Avatar src={avatarUrl(handle)} size={24} />
      <Box sx={{ fontWeight: "semibold", color: "fg.default" }}>{handle}</Box>
    </Box>
  );
}

export const MultiSelectUserColumnType: BaseColumnType<"multi-select-user"> = {
  type: "multi-select-user",
  renderCell: (cell: GridCell<"multi-select-user">) => (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
      {cell.response.users.length > 0 ? (
        <>
          {cell.response.users.map((handle: string, index: number) => (
            <User handle={handle} key={index} />
          ))}
        </>
      ) : (
        <>No user selected</>
      )}
    </Box>
  ),
  generateResponseSchema: () => multiSelectUserSchema,
  buildHydrationPrompt: () =>
    "Select users: Select multiple users and reply only with their handles",
  parseResponse: (
    responseContent: string,
  ): ColumnResponse["multi-select-user"] => {
    return JSON.parse(responseContent).users;
  },
};
